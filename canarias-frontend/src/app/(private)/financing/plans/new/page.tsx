"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useAuthStore } from "@/store/auth.store";
import { getProducts } from "@/services/product.service";
import {
  createFinancingPlan,
  getAllFinancingConfigurations,
} from "@/services/financing/financing.service";
import { useFinancingPlanForm } from "@/hooks/financing/useFinancingPlanForm";
import { FinancingPlanForm } from "@/components/financing/FinancingPlanForm";
import { Product } from "@/types/preload-sale/preload.type";
import { FinancingConfiguration } from "@/types/financing/financing.types";

export default function NewFinancingPlanPage() {
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
  } = useFinancingPlanForm();

  const [configs, setConfigs] = useState<FinancingConfiguration[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!selectedSocietyId) {
      router.replace("/select-society");
      return;
    }

    const load = async () => {
      try {
        setLoadingData(true);
        const [configsData, productsData] = await Promise.all([
          getAllFinancingConfigurations(),
          getProducts(),
        ]);
        setConfigs(configsData);
        setProducts(productsData);
      } catch (loadError) {
        console.error(loadError);
        setError(
          loadError instanceof Error
            ? loadError.message
            : "No se pudieron obtener los datos necesarios.",
        );
      } finally {
        setLoadingData(false);
      }
    };

    load();
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
      await createFinancingPlan(toCreatePayload());
      router.push("/financing");
    } catch (submitError) {
      console.error(submitError);
      setError(
        submitError instanceof Error
          ? submitError.message
          : "No se pudo crear el plan de financiación.",
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
            Nuevo plan de financiación
          </h1>
          <p className="mt-2 text-white/50">
            Definí un esquema de cuotas y frecuencia de pago.
          </p>
        </div>

        {loadingData ? (
          <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <p className="text-white/60">Cargando datos...</p>
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
            mode="create"
          />
        )}
      </div>
    </main>
  );
}
