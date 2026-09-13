"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { useAuthStore } from "@/store/auth.store";
import {
  getFinancingConfigurationById,
  updateFinancingConfiguration,
} from "@/services/financing/financing.service";
import { getProducts } from "@/services/product.service";
import { useFinancingConfigForm } from "@/hooks/financing/useFinancingConfigForm";
import { FinancingConfigForm } from "@/components/financing/FinancingConfigForm";
import { Product } from "@/types/preload-sale/preload.type";

export default function EditFinancingConfigPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const financingConfigId = params.id;

  const selectedSocietyId = useAuthStore((state) => state.selectedSocietyId);

  const {
    form,
    errors,
    loading,
    setLoading,
    updateField,
    loadConfig,
    validate,
    toUpdatePayload,
  } = useFinancingConfigForm();

  const [products, setProducts] = useState<Product[]>([]);
  const [loadingPage, setLoadingPage] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedSocietyId) {
      router.replace("/select-society");
      return;
    }

    const load = async () => {
      try {
        setLoadingPage(true);
        setError(null);

        const [config, productsData] = await Promise.all([
          getFinancingConfigurationById(financingConfigId),
          getProducts(),
        ]);

        loadConfig(config);
        setProducts(productsData);
      } catch (loadError) {
        console.error(loadError);
        setError(
          loadError instanceof Error
            ? loadError.message
            : "No se pudo cargar la configuración de financiación.",
        );
      } finally {
        setLoadingPage(false);
      }
    };

    load();
  }, [selectedSocietyId, router, financingConfigId, loadConfig]);

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }

    try {
      setError(null);
      setLoading(true);
      await updateFinancingConfiguration(financingConfigId, toUpdatePayload());
      router.push("/financing");
    } catch (submitError) {
      console.error(submitError);
      setError(
        submitError instanceof Error
          ? submitError.message
          : "No se pudieron guardar los cambios.",
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
            Editar configuración
          </h1>
          <p className="mt-2 text-white/50">
            Modificá la tasa base de financiación de la sociedad.
          </p>
        </div>

        {loadingPage ? (
          <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <p className="text-white/60">Cargando configuración...</p>
          </section>
        ) : error && !form.name ? (
          <section className="rounded-3xl border border-red-500/20 bg-red-500/10 p-6">
            <p className="text-red-400">{error}</p>
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
            mode="edit"
          />
        )}
      </div>
    </main>
  );
}
