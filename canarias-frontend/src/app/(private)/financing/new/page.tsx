"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { getProducts } from "@/services/product.service";
import { createFinancingConfiguration } from "@/services/financing/financing.service";
import { useFinancingConfigForm } from "@/hooks/financing/useFinancingConfigForm";
import { FinancingConfigForm } from "@/components/financing/FinancingConfigForm";
import { Product } from "@/types/preload-sale/preload.type";

export default function NewFinancingConfigPage() {
  const router = useRouter();
  const selectedSocietyId = useAuthStore((state) => state.selectedSocietyId);

  const {
    form,
    errors,
    loading,
    setLoading,
    updateField,
    validate,
    toCreatePayload,
  } = useFinancingConfigForm();

  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    if (!selectedSocietyId) {
      router.replace("/select-society");
      return;
    }

    const loadProducts = async () => {
      try {
        setLoadingProducts(true);
        const data = await getProducts();
        setProducts(data);
      } catch (loadError) {
        console.error(loadError);
        setError(
          loadError instanceof Error
            ? loadError.message
            : "No se pudieron obtener los productos.",
        );
      } finally {
        setLoadingProducts(false);
      }
    };

    loadProducts();
  }, [selectedSocietyId, router]);

  const handleSubmit = async () => {
    if (!selectedSocietyId) {
      setError("No hay una sociedad seleccionada.");
      return;
    }

    if (!validate()) {
      return;
    }

    try {
      setError(null);
      setLoading(true);
      await createFinancingConfiguration(toCreatePayload());
      router.push("/financing");
    } catch (submitError) {
      console.error(submitError);
      setError(
        submitError instanceof Error
          ? submitError.message
          : "No se pudo crear la configuración de financiación.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (!selectedSocietyId) {
    return null;
  }

  return (
    <main className="p-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white">
            Nueva configuración de financiación
          </h1>
          <p className="mt-2 text-white/50">
            Configurá una nueva tasa base de financiación para la sociedad.
          </p>
        </div>

        {loadingProducts ? (
          <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <p className="text-white/60">Cargando productos...</p>
          </section>
        ) : (
          <FinancingConfigForm
            form={form}
            updateField={updateField}
            products={products}
            handleSubmit={handleSubmit}
            loading={loading}
            error={error}
            errors={errors}
            mode="create"
          />
        )}
      </div>
    </main>
  );
}
