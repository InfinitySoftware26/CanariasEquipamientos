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
import { useZones } from "@/hooks/zones/useZones";
import { useInfoDialog } from "@/hooks/ui/useConfirmDialog";

const initialForm: PreloadFormData = {
  name: "",
  surname: "",
  documentNumber: "",
  email: "",
  address: "",
  locality: "",
  phone: "",
  zoneId: "",
  productId: "",
  quantity: 1,
  installmentsCount: 3,
  paymentFrequency: "monthly",
  nameReference1: "",
  telReference1: "",
  addressReference1: "",
  nameReference2: "",
  telReference2: "",
  addressReference2: "",
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
  const [form, setForm] = useState(initialForm);

  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searched, setSearched] = useState(false);
  const [clientFound, setClientFound] = useState(false);
  const [existingClient, setExistingClient] = useState<Client | null>(null);

  const { zones, loading: zonesLoading, error: zonesError } = useZones();
  const activeZones = zones.filter((zone) => zone.status === "active");

  const {
    open: infoOpen,
    message: infoMessage,
    openInfo,
    closeInfo,
  } = useInfoDialog();

  const loadedRef = useRef(false);
  const submittingRef = useRef(false);

  const [clientConfirmOpen, setClientConfirmOpen] = useState(false);

  const [clientConfirmType, setClientConfirmType] = useState<
    "existing" | "new" | null
  >(null);

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

      setSearched(true);

      // ---------------- CLIENT NOT FOUND ----------------

      if (!client) {
        setClientFound(false);
        setStep(2);
        openInfo({
          title: "Cliente no registrado",
          description:
            "El cliente no se encuentra registrado, se procederá a la solicitud de datos para crear el mismo.",
          actionText: "Continuar",
        });
        return;
      }

      // ---------------- CLIENT FOUND ----------------

      setClientFound(true);
      openInfo({
        title: "Cliente seleccionado",
        description: `Se utilizará al cliente ${client.name ?? ""} ${client.surname ?? ""} (DNI ${client.documentNumber ?? "-"}) en esta venta.`,
        actionText: "Continuar",
      });
      setExistingClient(client);

      setForm((prev) => ({
        ...prev,

        clientId: client.clientId,

        name: client.name ?? "",
        surname: client.surname ?? "",

        documentNumber: client.documentNumber ?? prev.documentNumber,

        address: client.address ?? "",
        zoneId: client.zoneId ?? "",

        phone: client.phone ?? "",
      }));

      setClientConfirmType("existing");
      setClientConfirmOpen(true);
    } catch (err) {
      console.error(err);
      setError("Error buscando cliente");
    } finally {
      setLoading(false);
    }
  }

  // ---------------- CLIENT CONFIRMATION ----------------

  function confirmClientSelection() {
    if (clientConfirmType === "new") {
      setStep(2);
    }

    if (clientConfirmType === "existing") {
      setStep(3);
    }

    setClientConfirmOpen(false);
    setClientConfirmType(null);
  }
  // ---------------- SALE STEP ----------------

  function goToSaleStep() {
    setStep(3);
  }

  // ---------------- SUBMIT ----------------

  async function handleSubmit() {
    try {
      if (submittingRef.current) return;

      submittingRef.current = true;

      setLoading(true);
      setError(null);

      console.log("=== HANDLE SUBMIT ===");

      console.log({
        existingClient,
        formClientId: form.clientId,
        clientFound,
        document: form.documentNumber,
      });

      let finalClientId = existingClient?.clientId ?? form.clientId;

      // ---------------- CREATE CLIENT IF NEEDED ----------------

      if (!finalClientId) {
        let client: Client | null = null;

        try {
          client = await createPreloadClient({
            name: form.name,
            surname: form.surname,
            documentNumber: form.documentNumber,
            address: form.address,
            phone: form.phone,
            zoneId: form.zoneId,
            nameReference1: form.nameReference1,
            telReference1: form.telReference1,
            addressReference1: form.addressReference1,
            nameReference2: form.nameReference2,
            telReference2: form.telReference2,
            addressReference2: form.addressReference2,
          });
        } catch (err) {
          console.warn("El cliente ya existe. Reintentando búsqueda...");

          client = await searchClientByDocument(form.documentNumber);

          setSearched(true);

          if (!client) {
            throw err;
          }
        }

        setExistingClient(client);
        setClientFound(true);

        setForm((prev) => ({
          ...prev,

          clientId: client.clientId,

          name: client.name ?? prev.name,
          surname: client.surname ?? prev.surname,

          documentNumber: client.documentNumber ?? prev.documentNumber,

          address: client.address ?? prev.address,
          phone: client.phone ?? prev.phone,
        }));

        finalClientId = client.clientId;
      }

      // ---------------- VALIDATE CLIENT ----------------

      if (!finalClientId) {
        throw new Error("clientId inválido");
      }

      // ---------------- VALIDATE PRODUCT ----------------

      if (!form.productId) {
        throw new Error("Seleccioná un producto");
      }

      const selectedProduct = products.find(
        (product) => product.productId === form.productId,
      );

      if (!selectedProduct) {
        throw new Error("Producto no válido");
      }

      // ---------------- CREATE SALE ----------------

      await createSale({
        clientId: finalClientId, // 🔥 SIEMPRE STRING
        installmentsCount: form.installmentsCount,

        paymentFrequency: form.paymentFrequency,
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
      submittingRef.current = false;
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

    searched,
    clientFound,

    clientConfirmOpen,
    setClientConfirmOpen,
    clientConfirmType,
    confirmClientSelection,

    zones: activeZones,
    zonesLoading,
    zonesError,

    infoOpen,
    infoMessage,
    closeInfo,

    handleSearchClient,
    handleSubmit,
    goToSaleStep,

    router,
  };
}
