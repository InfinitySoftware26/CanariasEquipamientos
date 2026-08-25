"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { useAuthStore } from "@/store/auth.store";
import { getProducts } from "@/services/product.service";
import {
  getFinancingPlans,
  getPromotionById,
  updatePromotion,
} from "@/services/financing/financing.service";
import { usePromotionForm } from "@/hooks/financing/usePromotionForm";
import { PromotionForm } from "@/components/financing/PromotionForm";
import { Product } from "@/types/preload-sale/preload.type";
import { FinancingPlan } from "@/types/financing/financing.types";

export default function EditPromotionPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const promotionId = params.id;

  const selectedSocietyId = useAuthStore((state) => state.selectedSocietyId);

  const {
    form,
    errors,
    loading,
    setLoading,
    updateField,
    loadPromotion,
    validate,
    toUpdatePayload,
  } = usePromotionForm();

  const [plans, setPlans] = useState<FinancingPlan[]>([]);
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

        const [promotion, plansData, productsData] = await Promise.all([
          getPromotionById(promotionId),
          getFinancingPlans(),
          getProducts(),
        ]);

        loadPromotion(promotion);
        setPlans(plansData);
        setProducts(productsData);
      } catch (loadError) {
        console.error(loadError);
        setError(
          loadError instanceof Error
            ? loadError.message
            : "No se pudo cargar la promoción.",
        );
      } finally {
        setLoadingPage(false);
      }
    };

    load();
  }, [selectedSocietyId, router, promotionId, loadPromotion]);

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }

    try {
      setError(null);
      setLoading(true);
      await updatePromotion(promotionId, toUpdatePayload());
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
          <h1 className="text-3xl font-bold text-white">Editar promoción</h1>
          <p className="mt-2 text-white/50">
            Modificá los datos de la promoción.
          </p>
        </div>

        {loadingPage ? (
          <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <p className="text-white/60">Cargando promoción...</p>
          </section>
        ) : error && !form.name ? (
          <section className="rounded-3xl border border-red-500/20 bg-red-500/10 p-6">
            <p className="text-red-400">{error}</p>
          </section>
        ) : (
          <PromotionForm
            form={form}
            updateField={updateField}
            plans={plans}
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
