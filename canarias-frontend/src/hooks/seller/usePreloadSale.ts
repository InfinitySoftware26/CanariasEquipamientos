"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { PreloadFormData } from "@/types/preloadForm.type";
import { getProducts } from "@/services/product.service";
import {
  createPreloadClient,
  searchClientByDocument,
} from "@/services/client.service";
import { createSale } from "@/services/sales.service";
import { ClientResponse } from "@/types/clientResponse.type";
import { Product } from "@/types/preload-sale/preload.type";

const initialForm: PreloadFormData = {
  name: "",
  surname: "",
  documentNumber: "",
  address: "",
  locality: "",
  phone: "",
  productId: "",
  quantity: 1,
  installmentsCount: 3 | 6 | 9,
  paymentFrequency: "monthly",
  firstDueDate: "",
  ref1Phone: "",
  ref1Relationship: "",
  ref1Address: "",
  ref2Phone: "",
  ref2Relationship: "",
  ref2Address: "",
};

export function usePreloadSale() {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState<PreloadFormData>(initialForm);

  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [clientFound, setClientFound] = useState(false);
  const [existingClient, setExistingClient] = useState<ClientResponse | null>(
    null,
  );

  const loadedRef = useRef(false);

  // ---------------- PRODUCTS ----------------
  async function loadProducts() {
    try {
      setProductsLoading(true);
      setError(null);

      const data = await getProducts();

      if (!Array.isArray(data)) {
        throw new Error("Productos inválidos");
      }

      setProducts(data);
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar los productos");
    } finally {
      setProductsLoading(false);
    }
  }

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;

    loadProducts();
  }, []);

  // ---------------- CLIENT SEARCH ----------------
  async function handleSearchClient() {
    if (!form.documentNumber) {
      setError("Ingresá un DNI");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const raw = await searchClientByDocument(form.documentNumber);

      console.log("LOOKUP RAW:", raw);

      // normalización real del objeto
      const client = raw?.data ?? raw;

      const clientId = client?.clientId ?? client?.client_id ?? client?.id;

      // 🔥 IMPORTANTE: log para verificar realidad
      console.log("CLIENT NORMALIZED:", client);
      console.log("CLIENT ID:", clientId);

      // SOLO esta condición manda el flujo
      if (!clientId) {
        setStep(2);
        return;
      }

      setClientFound(true);

      const normalizedClient = {
        ...client,
        clientId,
      };

      setExistingClient(normalizedClient);

      setForm((prev) => ({
        ...prev,
        name: client?.name ?? "",
        surname: client?.surname ?? "",
        address: client?.address ?? "",
        phone: client?.phone ?? "",
      }));

      setStep(3);
    } catch (err) {
      console.error(err);
      setError("Error buscando cliente");
    } finally {
      setLoading(false);
    }
  }

  function goToSaleStep() {
    setStep(3);
  }

  // ---------------- SUBMIT ----------------
  async function handleSubmit() {
    try {
      setLoading(true);
      setError(null);

      const clientId = existingClient?.clientId;

      let finalClientId = clientId;

      if (!finalClientId) {
        const client = await createPreloadClient({
          name: form.name,
          surname: form.surname,
          documentNumber: form.documentNumber,
          address: form.address,
          phone: form.phone,
          observations: form.locality,
        });

        finalClientId = client.clientId ?? client;
      }

      if (!finalClientId) {
        throw new Error("No se pudo obtener el ID del cliente");
      }

      if (!form.productId) {
        throw new Error("Seleccioná un producto");
      }

      const selectedProduct = products.find(
        (p) => p.productId === form.productId,
      );
      console.log(selectedProduct);

      if (!selectedProduct) {
        throw new Error("Producto no válido");
      }
      console.log("SALE PAYLOAD", {
        clientId: finalClientId,
        saleDate: new Date().toISOString(),
        installmentsCount: form.installmentsCount,
        paymentFrequency: form.paymentFrequency,
        firstDueDate: form.firstDueDate,
        observation: `Localidad: ${form.locality}`,
        products: [
          {
            productId: form.productId,
            quantity: form.quantity,
            unitPrice: Number(selectedProduct.price),
          },
        ],
      });
      await createSale({
        clientId: finalClientId,
        saleDate: new Date().toISOString(),
        installmentsCount: form.installmentsCount,
        paymentFrequency: form.paymentFrequency,
        firstDueDate: form.firstDueDate,
        observation: `Localidad: ${form.locality}`,
        products: [
          {
            productId: form.productId,
            quantity: form.quantity,
            unitPrice: Number(selectedProduct.price),
          },
        ],
      });

      router.push("/dashboard/seller");
    } catch (err) {
      console.error(err);
      setError("Error creando la venta");
    } finally {
      setLoading(false);
    }
  }

  return {
    step,
    form,
    setForm,

    products,
    productsLoading,

    loading,
    error,
    clientFound,

    loadProducts,
    handleSearchClient,
    handleSubmit,
    goToSaleStep,

    router,
  };
}
