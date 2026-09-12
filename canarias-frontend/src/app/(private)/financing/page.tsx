"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit2, Trash2 } from "lucide-react";

import { AddButtonLink } from "@/components/button/AddButtonLink";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useAuthStore } from "@/store/auth.store";
import {
  deleteFinancingConfiguration,
  deleteFinancingPlan,
  deletePromotion,
  getAllFinancingConfigurations,
  getFinancingPlans,
  getPromotions,
} from "@/services/financing/financing.service";
import {
  FinancingConfiguration,
  FinancingPlan,
  FinancingTabValue,
  Promotion,
  PAYMENT_FREQUENCY_LABELS,
} from "@/types/financing/financing.types";

const tabConfig: Array<{ value: FinancingTabValue; label: string }> = [
  { value: "configurations", label: "Configuraciones" },
  { value: "plans", label: "Planes" },
  { value: "promotions", label: "Promociones" },
];

/**
 * Formatea un número decimal como porcentaje.
 * @example formatRate(0.12) => "12%"
 */
function formatRate(value?: number | null): string {
  if (value === undefined || value === null || Number.isNaN(value)) {
    return "-";
  }
  return `${(Number(value) * 100).toFixed(0)}%`;
}

/**
 * Formatea la frecuencia de pago al español.
 */
function formatFrequency(value?: string | null): string {
  return (
    PAYMENT_FREQUENCY_LABELS[value as keyof typeof PAYMENT_FREQUENCY_LABELS] ??
    "-"
  );
}

type PendingDelete =
  | { type: "config"; id: string; name: string }
  | { type: "plan"; id: string; name: string }
  | { type: "promotion"; id: string; name: string };

export default function FinancingPage() {
  const router = useRouter();
  const selectedSocietyId = useAuthStore((state) => state.selectedSocietyId);

  const [activeTab, setActiveTab] =
    useState<FinancingTabValue>("configurations");
  const [configs, setConfigs] = useState<FinancingConfiguration[]>([]);
  const [plans, setPlans] = useState<FinancingPlan[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(
    null,
  );
  const [deleting, setDeleting] = useState(false);

  // Cargar datos al montar o cambiar de sociedad
  useEffect(() => {
    if (!selectedSocietyId) {
      router.replace("/select-society");
      return;
    }

    let isMounted = true;

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [configsResult, plansResult, promotionsResult] =
          await Promise.allSettled([
            getAllFinancingConfigurations(),
            getFinancingPlans(),
            getPromotions(),
          ]);

        if (!isMounted) return;

        // Procesar resultados
        if (configsResult.status === "fulfilled") {
          setConfigs(configsResult.value);
        } else {
          setConfigs([]);
          console.error(
            "Error cargando configuraciones:",
            configsResult.reason,
          );
        }

        if (plansResult.status === "fulfilled") {
          setPlans(plansResult.value);
        } else {
          setPlans([]);
          console.error("Error cargando planes:", plansResult.reason);
        }

        if (promotionsResult.status === "fulfilled") {
          setPromotions(promotionsResult.value);
        } else {
          setPromotions([]);
          console.error("Error cargando promociones:", promotionsResult.reason);
        }
      } catch (loadError) {
        if (isMounted) {
          console.error(
            "Error crítico cargando datos de financiación:",
            loadError,
          );
          setError(
            loadError instanceof Error
              ? loadError.message
              : "No se pudo cargar la información de financiación.",
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadData();

    return () => {
      isMounted = false;
    };
  }, [router, selectedSocietyId]);

  const actionLabel = useMemo(() => {
    switch (activeTab) {
      case "plans":
        return " Nuevo plan";
      case "promotions":
        return " Nueva promoción";
      default:
        return " Nueva financiación";
    }
  }, [activeTab]);

  const actionHref = useMemo(() => {
    switch (activeTab) {
      case "plans":
        return "/financing/plans/new";
      case "promotions":
        return "/financing/promotions/new";
      default:
        return "/financing/new";
    }
  }, [activeTab]);

  const handleDeleteConfig = async (financingConfigId: string) => {
    try {
      setDeleting(true);
      await deleteFinancingConfiguration(financingConfigId);
      setConfigs((current) =>
        current.filter(
          (config) => config.financingConfigId !== financingConfigId,
        ),
      );
      setPendingDelete(null);
    } catch (deleteError) {
      console.error(deleteError);
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "No se pudo eliminar la configuración.",
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleDeletePlan = async (financingPlanId: string) => {
    try {
      setDeleting(true);
      await deleteFinancingPlan(financingPlanId);
      setPlans((current) =>
        current.filter((plan) => plan.financingPlanId !== financingPlanId),
      );
      setPendingDelete(null);
    } catch (deleteError) {
      console.error(deleteError);
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "No se pudo eliminar el plan.",
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleDeletePromotion = async (promotionId: string) => {
    try {
      setDeleting(true);
      await deletePromotion(promotionId);
      setPromotions((current) =>
        current.filter((promo) => promo.promotionId !== promotionId),
      );
      setPendingDelete(null);
    } catch (deleteError) {
      console.error(deleteError);
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "No se pudo eliminar la promoción.",
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleConfirmDelete = () => {
    if (!pendingDelete) return;

    if (pendingDelete.type === "config") {
      void handleDeleteConfig(pendingDelete.id);
    } else if (pendingDelete.type === "plan") {
      void handleDeletePlan(pendingDelete.id);
    } else {
      void handleDeletePromotion(pendingDelete.id);
    }
  };

  if (!selectedSocietyId) {
    return null;
  }

  if (loading) {
    return (
      <div className="p-6 text-white">
        <div className="h-8 w-48 animate-pulse rounded bg-white/10" />
      </div>
    );
  }

  // Renderizar contenido del tab activo
  const tabContent = (() => {
    // TAB: Configuraciones de Financiación
    if (activeTab === "configurations") {
      return configs.length === 0 ? (
        <Card className="border border-dashed border-white/10 bg-white/[0.02]">
          <CardContent className="p-6 text-white/60">
            No hay configuraciones de financiación. Crea una nueva para empezar.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {configs.map((config) => (
            <Card
              key={config.financingConfigId}
              className="group border border-white/10 bg-white/[0.03] transition hover:border-white/20 hover:bg-white/[0.05]"
            >
              <CardHeader className="pb-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold text-white">
                      {config.name}
                    </CardTitle>
                    <p className="mt-1 text-xs text-white/50">
                      {config.isGlobal ? "Global" : "Específica"}
                    </p>
                  </div>
                  <span
                    className={`whitespace-nowrap rounded-full px-2 py-1 text-[10px] font-semibold ${
                      config.isActive
                        ? "bg-emerald-500/15 text-emerald-300"
                        : "bg-red-500/10 text-red-300"
                    }`}
                  >
                    {config.isActive ? "Activa" : "Inactiva"}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pt-4">
                <div className="rounded-lg bg-[#F5A300]/10 px-3 py-2">
                  <p className="text-xs text-white/60">Tasa de financiación</p>
                  <p className="mt-1 text-2xl font-semibold text-[#F5A300]">
                    {formatRate(config.financingRate)}
                  </p>
                </div>

                {!config.isGlobal && config.products.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-white/60">
                      Productos:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {config.products.map((prod) => (
                        <span
                          key={prod.productId}
                          className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] text-white/70"
                        >
                          {prod.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 border-t border-white/10 pt-3 opacity-0 transition group-hover:opacity-100">
                  <button
                    onClick={() =>
                      router.push(`/financing/${config.financingConfigId}/edit`)
                    }
                    className="flex-1 rounded-lg bg-white/5 px-2 py-1.5 text-xs font-medium text-white hover:bg-white/10"
                  >
                    <Edit2 className="mr-1 inline h-3 w-3" /> Editar
                  </button>
                  <button
                    onClick={() =>
                      setPendingDelete({
                        type: "config",
                        id: config.financingConfigId,
                        name: config.name,
                      })
                    }
                    className="flex-1 rounded-lg bg-red-500/10 px-2 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/20"
                  >
                    <Trash2 className="mr-1 inline h-3 w-3" /> Eliminar
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    // TAB: Planes de Financiación
    if (activeTab === "plans") {
      return plans.length === 0 ? (
        <Card className="border border-dashed border-white/10 bg-white/[0.02]">
          <CardContent className="p-6 text-white/60">
            No hay planes de financiación cargados.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {plans.map((plan) => (
            <Card
              key={plan.financingPlanId}
              className="group border border-white/10 bg-white/[0.03] transition hover:border-white/20"
            >
              <CardHeader className="pb-0">
                <div className="flex items-start justify-between gap-3">
                  <CardTitle className="text-lg font-semibold text-white">
                    {plan.name}
                  </CardTitle>
                  <span
                    className={`whitespace-nowrap rounded-full px-2 py-1 text-[10px] font-semibold ${
                      plan.isActive
                        ? "bg-emerald-500/15 text-emerald-300"
                        : "bg-red-500/10 text-red-300"
                    }`}
                  >
                    {plan.isActive ? "Activo" : "Inactivo"}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 pt-4 text-sm text-white/70">
                <div className="rounded-lg bg-white/5 px-3 py-2">
                  <p className="text-xs text-white/50">Plan de cuotas</p>
                  <p className="mt-1 font-semibold text-white">
                    {plan.installmentsCount} cuotas ·{" "}
                    {formatFrequency(plan.paymentFrequency)}
                  </p>
                </div>
                <p className="text-xs">
                  {plan.isGlobal ? "✓ Global" : "✗ Específico"} •{" "}
                  {plan.products.length} productos
                </p>
                <div className="flex gap-2 border-t border-white/10 pt-3 opacity-0 transition group-hover:opacity-100">
                  <button
                    onClick={() =>
                      router.push(
                        `/financing/plans/${plan.financingPlanId}/edit`,
                      )
                    }
                    className="flex-1 rounded-lg bg-white/5 px-2 py-1.5 text-xs font-medium text-white hover:bg-white/10"
                  >
                    <Edit2 className="mr-1 inline h-3 w-3" /> Editar
                  </button>
                  <button
                    onClick={() =>
                      setPendingDelete({
                        type: "plan",
                        id: plan.financingPlanId,
                        name: plan.name,
                      })
                    }
                    className="flex-1 rounded-lg bg-red-500/10 px-2 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/20"
                  >
                    <Trash2 className="mr-1 inline h-3 w-3" /> Eliminar
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    // TAB: Promociones
    if (activeTab === "promotions") {
      return promotions.length === 0 ? (
        <Card className="border border-dashed border-white/10 bg-white/[0.02]">
          <CardContent className="p-6 text-white/60">
            No hay promociones cargadas.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {promotions.map((promo) => (
            <Card
              key={promo.promotionId}
              className="group border border-white/10 bg-white/[0.03] transition hover:border-white/20"
            >
              <CardHeader className="pb-0">
                <div className="flex items-start justify-between gap-3">
                  <CardTitle className="text-lg font-semibold text-white">
                    {promo.name}
                  </CardTitle>
                  <span
                    className={`whitespace-nowrap rounded-full px-2 py-1 text-[10px] font-semibold ${
                      promo.isActive
                        ? "bg-emerald-500/15 text-emerald-300"
                        : "bg-red-500/10 text-red-300"
                    }`}
                  >
                    {promo.isActive ? "Activa" : "Inactiva"}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 pt-4 text-sm text-white/70">
                {promo.plan && (
                  <div className="rounded-lg bg-white/5 px-3 py-2">
                    <p className="text-xs text-white/50">Plan vinculado</p>
                    <p className="mt-1 font-semibold text-white">
                      {promo.plan.name}
                    </p>
                  </div>
                )}
                {promo.discountPercentage !== undefined &&
                  promo.discountPercentage !== null && (
                    <div className="rounded-lg bg-[#F5A300]/10 px-3 py-2">
                      <p className="text-xs text-white/50">
                        {promo.discountPercentage >= 0
                          ? "Descuento"
                          : "Recargo"}
                      </p>
                      <p className="mt-1 font-semibold text-[#F5A300]">
                        {promo.discountPercentage >= 0 ? "-" : "+"}
                        {formatRate(Math.abs(promo.discountPercentage))}
                      </p>
                    </div>
                  )}
                <p className="text-xs">
                  {promo.installmentsCount && promo.paymentFrequency
                    ? `${promo.installmentsCount} cuotas · ${formatFrequency(promo.paymentFrequency)}`
                    : "Configuración flexible"}
                </p>
                <div className="flex gap-2 border-t border-white/10 pt-3 opacity-0 transition group-hover:opacity-100">
                  <button
                    onClick={() =>
                      router.push(
                        `/financing/promotions/${promo.promotionId}/edit`,
                      )
                    }
                    className="flex-1 rounded-lg bg-white/5 px-2 py-1.5 text-xs font-medium text-white hover:bg-white/10"
                  >
                    <Edit2 className="mr-1 inline h-3 w-3" /> Editar
                  </button>
                  <button
                    onClick={() =>
                      setPendingDelete({
                        type: "promotion",
                        id: promo.promotionId,
                        name: promo.name,
                      })
                    }
                    className="flex-1 rounded-lg bg-red-500/10 px-2 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/20"
                  >
                    <Trash2 className="mr-1 inline h-3 w-3" /> Eliminar
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }
  })();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Financiación</h1>
          <p className="mt-2 text-white/50">
            Gestiona configuraciones, planes y promociones de financiación
          </p>
        </div>
        <AddButtonLink href={actionHref}>
          <Plus className="mr-2 h-5 w-5" />
          {actionLabel}
        </AddButtonLink>
      </div>

      {/* Tab Navigation */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-2">
        <div className="flex flex-wrap gap-2">
          {tabConfig.map((tab) => {
            const isActive = tab.value === activeTab;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => setActiveTab(tab.value)}
                className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-[#F5A300] text-[#0D1B2A]"
                    : "bg-transparent text-white/65 hover:bg-white/5 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <section className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-red-300">
          <p className="text-sm font-medium">Error</p>
          <p className="mt-1 text-xs">{error}</p>
        </section>
      )}

      {/* Tab Content */}
      {tabContent}

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
        title={
          pendingDelete?.type === "plan"
            ? "Eliminar plan de financiación"
            : pendingDelete?.type === "promotion"
              ? "Eliminar promoción"
              : "Eliminar configuración de financiación"
        }
        description={`¿Está seguro que desea eliminar "${pendingDelete?.name}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        loading={deleting}
        destructive
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
