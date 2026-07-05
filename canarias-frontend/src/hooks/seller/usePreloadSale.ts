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
import { Product } from "@/types/preload-sale/preload.type";
import { Client } from "@/types/cretateClient.type";

const initialForm: PreloadFormData = {
  name: "",
  surname: "",
  documentNumber: "",
  email: "",
  address: "",
  locality: "",
  phone: "",
  productId: "",
  quantity: 1,
  installmentsCount: 3,
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
  const [existingClient, setExistingClient] = useState<Client | null>(null);

  const loadedRef = useRef(false);

  // ---------------- PRODUCTS ----------------
  async function loadProducts() {
    try {
      setProductsLoading(true);
      setError(null);

      const data = await getProducts();
      setProducts(Array.isArray(data) ? data : []);
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

      const client = await searchClientByDocument(form.documentNumber);
      console.log("Respuesta del backend:", client);
      if (!client) {
        setClientFound(false);
        setStep(2);
        return;
      }
      console.log("Encontrado, seteando true");
      setClientFound(true);
      setExistingClient(client);

      setForm((prev) => ({
        ...prev,

        clientId: client.clientId,

        name: client.name ?? "",
        surname: client.surname ?? "",

        documentNumber:
          client.documentNumber ??
          prev.documentNumber,

        address:
          client.address ?? "",

        phone:
          client.phone ?? "",
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

      let finalClientId = existingClient?.clientId;

      // 🔥 CREAR CLIENTE SI NO EXISTE
      if (!finalClientId) {
        const created = await createPreloadClient({
          name: form.name,
          surname: form.surname,
          documentNumber: form.documentNumber,
          address: form.address,
          phone: form.phone,
        });

        const clientId = created.clientId;

        finalClientId = clientId;
      }

      if (!finalClientId) {
        throw new Error("clientId inválido");
      }

      if (!form.productId) {
        throw new Error("Seleccioná un producto");
      }

      const selectedProduct = products.find(
        (p) => p.productId === form.productId,
      );

      if (!selectedProduct) {
        throw new Error("Producto no válido");
      }

      await createSale({
        clientId: finalClientId, // 🔥 SIEMPRE STRING
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

    handleSearchClient,
    handleSubmit,
    goToSaleStep,
    router,
  };
}
