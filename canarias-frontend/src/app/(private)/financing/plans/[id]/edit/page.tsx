"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { useAuthStore } from "@/store/auth.store";
import { getProducts } from "@/services/product.service";
import {
  getAllFinancingConfigurations,
  getFinancingPlanById,
  updateFinancingPlan,
} from "@/services/financing/financing.service";
import { useFinancingPlanForm } from "@/hooks/financing/useFinancingPlanForm";
import { FinancingPlanForm } from "@/components/financing/FinancingPlanForm";
import { Product } from "@/types/preload-sale/preload.type";
import { FinancingConfiguration } from "@/types/financing/financing.types";

export default function EditFinancingPlanPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const financingPlanId = params.id;

  const selectedSocietyId = useAuthStore((state) => state.selectedSocietyId);

  const {
    form,
    errors,
    loading,
    setLoading,
    updateField,
    loadPlan,
    validate,
    toUpdatePayload,
  } = useFinancingPlanForm();

  const [configs, setConfigs] = useState<FinancingConfiguration[]>([]);
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

        const [plan, configsData, productsData] = await Promise.all([
          getFinancingPlanById(financingPlanId),
          getAllFinancingConfigurations(),
          getProducts(),
        ]);

        loadPlan(plan);
        setConfigs(configsData);
        setProducts(productsData);
      } catch (loadError) {
        console.error(loadError);
        setError(
          loadError instanceof Error
            ? loadError.message
            : "No se pudo cargar el plan de financiación.",
        );
      } finally {
        setLoadingPage(false);
      }
    };

    load();
  }, [selectedSocietyId, router, financingPlanId, loadPlan]);

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }

    try {
      setError(null);
      setLoading(true);
      await updateFinancingPlan(financingPlanId, toUpdatePayload());
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
            Editar plan de financiación
          </h1>
          <p className="mt-2 text-white/50">
            Modificá el esquema de cuotas y frecuencia.
          </p>
        </div>

        {loadingPage ? (
          <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <p className="text-white/60">Cargando plan...</p>
          </section>
        ) : error && !form.name ? (
          <section className="rounded-3xl border border-red-500/20 bg-red-500/10 p-6">
            <p className="text-red-400">{error}</p>
          </section>
        ) : (
          <FinancingPlanForm
            form={form}
            updateField={updateField}
            configs={configs}
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
