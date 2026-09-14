"use client";

import {
  Package,
  Sparkles,
  Tag,
  Sliders,
  User,
  ShieldCheck,
} from "lucide-react";
import { StepTitle } from "./StepTitle";
import { StepSaleProps } from "@/types/preload-sale/preload.type";
import { useState, useMemo, useEffect } from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";

type Option<T> = {
  label: string;
  value: T;
};

export function StepSale({
  form,
  setForm,
  products,
  plans,
  promotions,
  configs,
  zones,
  handleSubmit,
  loading,
}: StepSaleProps) {
  const [openPlan, setOpenPlan] = useState(false);
  const [openPromo, setOpenPromo] = useState(false);
  const [openConfig, setOpenConfig] = useState(false);
  const [openProduct, setOpenProduct] = useState(false);
  const [openFrequency, setOpenFrequency] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);

  // ---------------- ZONA SELECCIONADA ----------------
  const clientZone = useMemo(
    () => zones?.find((z) => z.zoneId === form.zoneId),
    [zones, form.zoneId],
  );

  // ---------------- PLAN SELECCIONADO ----------------
  const selectedPlan = useMemo(
    () => plans.find((p) => p.financingPlanId === form.financingPlanId),
    [plans, form.financingPlanId],
  );

  // ---------------- PROMOCIÓN SELECCIONADA ----------------
  const selectedPromo = useMemo(
    () => promotions.find((p) => p.promotionId === form.promotionId),
    [promotions, form.promotionId],
  );

  // ---------------- CONFIGURACIÓN DE FINANCIACIÓN (MODO PERSONALIZADO) ----------------
  const selectedConfig = useMemo(
    () => configs?.find((c) => c.financingConfigId === form.financingConfigId),
    [configs, form.financingConfigId],
  );

  // Auto-seleccionar primer plan o promo si no hay nada seleccionado al entrar en esos modos
  useEffect(() => {
    if (form.saleMode === "plan" && !form.financingPlanId && plans.length > 0) {
      const firstPlan = plans[0];
      setForm((prev) => ({
        ...prev,
        financingPlanId: firstPlan.financingPlanId,
        promotionId: "",
        installmentsCount: firstPlan.installmentsCount,
        paymentFrequency: firstPlan.paymentFrequency,
      }));
    } else if (
      form.saleMode === "promotion" &&
      !form.promotionId &&
      promotions.length > 0
    ) {
      const firstPromo = promotions[0];
      setForm((prev) => ({
        ...prev,
        promotionId: firstPromo.promotionId,
        financingPlanId: firstPromo.financingPlanId ?? "",
        installmentsCount:
          firstPromo.installmentsCount ??
          firstPromo.plan?.installmentsCount ??
          prev.installmentsCount,
        paymentFrequency:
          firstPromo.paymentFrequency ??
          firstPromo.plan?.paymentFrequency ??
          prev.paymentFrequency,
      }));
    }
  }, [
    form.saleMode,
    plans,
    promotions,
    setForm,
    form.financingPlanId,
    form.promotionId,
  ]);

  // ---------------- PRODUCTOS FILTRADOS SEGÚN MODO ----------------
  const availableProducts = useMemo(() => {
    if (form.saleMode === "plan" && selectedPlan) {
      if (!selectedPlan.isGlobal) {
        const allowedIds = new Set(
          selectedPlan.products?.map((p) => p.productId) ?? [],
        );
        return products.filter((p) => allowedIds.has(p.productId));
      }
      return products;
    }

    if (form.saleMode === "promotion" && selectedPromo) {
      if (selectedPromo.financingPlanId) {
        // Viene de un plan: buscar el plan completo
        const basePlan =
          selectedPromo.plan ||
          plans.find(
            (p) => p.financingPlanId === selectedPromo.financingPlanId,
          );

        if (basePlan && !basePlan.isGlobal) {
          const allowedIds = new Set(
            basePlan.products?.map((p) => p.productId) ?? [],
          );
          return products.filter((p) => allowedIds.has(p.productId));
        }

        if (!selectedPromo.isGlobal && selectedPromo.products?.length > 0) {
          const allowedIds = new Set(
            selectedPromo.products.map((p) => p.productId),
          );
          return products.filter((p) => allowedIds.has(p.productId));
        }

        return products;
      }

      // Promoción independiente
      if (!selectedPromo.isGlobal && selectedPromo.products?.length > 0) {
        const allowedIds = new Set(
          selectedPromo.products.map((p) => p.productId),
        );
        return products.filter((p) => allowedIds.has(p.productId));
      }

      return products;
    }

    return products;
  }, [form.saleMode, selectedPlan, selectedPromo, plans, products]);

  const selectedProduct = products.find((p) => p.productId === form.productId);

  // ---------------- TASA EFECTIVA Y CÁLCULOS ----------------
  const effectiveRate = useMemo(() => {
    if (form.saleMode === "plan" && selectedPlan) {
      if (
        selectedPlan.financingRate !== null &&
        selectedPlan.financingRate !== undefined
      ) {
        return Number(selectedPlan.financingRate);
      }
      if (selectedPlan.financingConfiguration) {
        return Number(selectedPlan.financingConfiguration.financingRate);
      }
      return 0;
    }

    if (form.saleMode === "promotion" && selectedPromo) {
      if (selectedPromo.financingPlanId) {
        const basePlan =
          selectedPromo.plan ||
          plans.find(
            (p) => p.financingPlanId === selectedPromo.financingPlanId,
          );

        let baseRate = 0;
        if (
          basePlan?.financingRate !== null &&
          basePlan?.financingRate !== undefined
        ) {
          baseRate = Number(basePlan.financingRate);
        } else if (basePlan?.financingConfiguration) {
          baseRate = Number(basePlan.financingConfiguration.financingRate);
        }
        const discount = Number(selectedPromo.discountPercentage ?? 0);
        return Math.max(0, baseRate + discount);
      }
      return Math.max(0, Number(selectedPromo.discountPercentage ?? 0));
    }

    // Modo personalizado
    if (form.saleMode === "custom") {
      if (form.customRateType === "config" && selectedConfig) {
        return Number(selectedConfig.financingRate);
      }
      if (form.customRateType === "custom" && form.customRate !== "") {
        return (Number(form.customRate) || 0) / 100;
      }
      return 0;
    }

    return 0;
  }, [
    form.saleMode,
    form.customRateType,
    form.customRate,
    selectedPlan,
    selectedPromo,
    selectedConfig,
    plans,
  ]);

  const unitPrice = selectedProduct ? Number(selectedProduct.price) : 0;
  const baseSubtotal = unitPrice * (form.quantity || 1);
  const totalWithFinancing =
    Math.round(baseSubtotal * (1 + effectiveRate) * 100) / 100;
  const installmentCount = form.installmentsCount || 1;
  const installmentAmount =
    Math.round((totalWithFinancing / installmentCount) * 100) / 100;

  const frequencyOptions: Option<
    "weekly" | "monthly" | "biweekly" | "daily"
  >[] = [
    { label: "Mensual", value: "monthly" },
    { label: "Semanal", value: "weekly" },
    { label: "Quincenal", value: "biweekly" },
    { label: "Diaria", value: "daily" },
  ];

  const formatFrequencyLabel = (freq: string) => {
    switch (freq) {
      case "daily":
        return "Diaria";
      case "weekly":
        return "Semanal";
      case "biweekly":
        return "Quincenal";
      case "monthly":
        return "Mensual";
      default:
        return freq;
    }
  };

  const selectedFrequency = frequencyOptions.find(
    (o) => o.value === form.paymentFrequency,
  );

  const saleDescription = `Se creará una venta para ${form.name} ${form.surname} de ${
    form.quantity
  }x ${selectedProduct?.name ?? "producto"} en ${form.installmentsCount} cuotas ${formatFrequencyLabel(
    form.paymentFrequency,
  ).toLowerCase()} de $${installmentAmount.toLocaleString("es-AR", {
    minimumFractionDigits: 2,
  })} (Total financiado: $${totalWithFinancing.toLocaleString("es-AR", {
    minimumFractionDigits: 2,
  })}).`;

  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
      <StepTitle icon={<Package size={18} />} label="Venta" />

      <div className="space-y-4">
        <div className="space-y-2.5 rounded-2xl border border-[#F5A300]/20 bg-[#F5A300]/5 p-4">
          <p className="text-sm font-semibold uppercase tracking-wider text-[#F5A300]">
            Detalle del Cliente
          </p>

          {/* BLOQUE 1: DATOS DEL CLIENTE */}
          <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
            <div className="flex items-center gap-1.5 text-sm font-semibold text-white/70">
              <User className="h-3.5 w-3.5 text-[#F5A300]" />
              <span>Titular</span>
            </div>
            <div className="mt-2 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
              <div>
                <span className="text-white/50">Nombre: </span>
                <span className="font-medium text-white">
                  {form.name} {form.surname}
                </span>
              </div>
              <div>
                <span className="text-white/50">DNI: </span>
                <span className="font-medium text-white">
                  {form.documentNumber || "-"}
                </span>
              </div>
              <div>
                <span className="text-white/50">Dirección: </span>
                <span className="font-medium text-white">
                  {form.address || "-"}
                </span>
              </div>
              <div>
                <span className="text-white/50">Teléfono: </span>
                <span className="font-medium text-white">
                  {form.phone || "-"}
                </span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-white/50">Zona: </span>
                <span className="font-medium text-white">
                  {clientZone?.name || form.locality || "-"}
                </span>
              </div>
            </div>
          </div>

          {/* BLOQUE 2: REFERENCIA 1 */}
          <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
            <div className="flex items-center gap-1.5 text-sm font-semibold text-white/70">
              <ShieldCheck className="h-3.5 w-3.5 text-[#F5A300]" />
              <span>Referencia 1</span>
            </div>
            <div className="mt-2 grid grid-cols-1 gap-2 text-sm sm:grid-cols-3">
              <div>
                <span className="text-white/50">Nombre: </span>
                <span className="font-medium text-white">
                  {form.nameReference1 || "-"}
                </span>
              </div>
              <div>
                <span className="text-white/50">Teléfono: </span>
                <span className="font-medium text-white">
                  {form.telReference1 || "-"}
                </span>
              </div>
              <div>
                <span className="text-white/50">Dirección: </span>
                <span className="font-medium text-white">
                  {form.addressReference1 || "-"}
                </span>
              </div>
            </div>
          </div>

          {/* BLOQUE 3: REFERENCIA 2 */}
          <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
            <div className="flex items-center gap-1.5 text-sm font-semibold text-white/70">
              <ShieldCheck className="h-3.5 w-3.5 text-[#F5A300]" />
              <span>Referencia 2</span>
            </div>
            <div className="mt-2 grid grid-cols-1 gap-2 text-sm sm:grid-cols-3">
              <div>
                <span className="text-white/50">Nombre: </span>
                <span className="font-medium text-white">
                  {form.nameReference2 || "-"}
                </span>
              </div>
              <div>
                <span className="text-white/50">Teléfono: </span>
                <span className="font-medium text-white">
                  {form.telReference2 || "-"}
                </span>
              </div>
              <div>
                <span className="text-white/50">Dirección: </span>
                <span className="font-medium text-white">
                  {form.addressReference2 || "-"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ---------------- SELECTOR DE MODALIDAD (PLAN / PROMO / PERSONALIZADO) ---------------- */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/70">
            Modalidad de Venta
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => {
                const firstPlan = plans[0];
                setForm((prev) => ({
                  ...prev,
                  saleMode: "plan",
                  financingPlanId: firstPlan?.financingPlanId ?? "",
                  promotionId: "",
                  installmentsCount:
                    firstPlan?.installmentsCount ?? prev.installmentsCount,
                  paymentFrequency:
                    firstPlan?.paymentFrequency ?? prev.paymentFrequency,
                }));
              }}
              className={`flex flex-col items-center justify-center gap-1 rounded-xl p-2.5 text-xs font-medium transition ${
                form.saleMode === "plan"
                  ? "border border-[#F5A300] bg-[#F5A300]/20 text-[#F5A300]"
                  : "border border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
              }`}
            >
              <Sparkles className="h-4 w-4" />
              <span>Plan</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const firstPromo = promotions[0];
                setForm((prev) => ({
                  ...prev,
                  saleMode: "promotion",
                  promotionId: firstPromo?.promotionId ?? "",
                  financingPlanId: firstPromo?.financingPlanId ?? "",
                  installmentsCount:
                    firstPromo?.installmentsCount ??
                    firstPromo?.plan?.installmentsCount ??
                    prev.installmentsCount,
                  paymentFrequency:
                    firstPromo?.paymentFrequency ??
                    firstPromo?.plan?.paymentFrequency ??
                    prev.paymentFrequency,
                }));
              }}
              className={`flex flex-col items-center justify-center gap-1 rounded-xl p-2.5 text-xs font-medium transition ${
                form.saleMode === "promotion"
                  ? "border border-[#F5A300] bg-[#F5A300]/20 text-[#F5A300]"
                  : "border border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
              }`}
            >
              <Tag className="h-4 w-4" />
              <span>Promoción</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setForm((prev) => ({
                  ...prev,
                  saleMode: "custom",
                  financingPlanId: "",
                  promotionId: "",
                  customRateType: prev.customRateType || "config",
                  customRate: prev.customRate || "0",
                }));
              }}
              className={`flex flex-col items-center justify-center gap-1 rounded-xl p-2.5 text-xs font-medium transition ${
                form.saleMode === "custom"
                  ? "border border-[#F5A300] bg-[#F5A300]/20 text-[#F5A300]"
                  : "border border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
              }`}
            >
              <Sliders className="h-4 w-4" />
              <span>Personalizado</span>
            </button>
          </div>
        </div>

        {/* ---------------- DETALLE DEL MODO SELECCIONADO ---------------- */}

        {/* MODO 1: PLAN DE FINANCIACIÓN */}
        {form.saleMode === "plan" && (
          <div className="space-y-3">
            <div className="relative">
              <label className="mb-1 block text-xs text-white/60">
                Seleccionar Plan de Financiación
              </label>
              <button
                type="button"
                onClick={() => setOpenPlan(!openPlan)}
                className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-left text-white transition hover:border-[#F5A300]/60 focus:border-[#F5A300] focus:outline-none"
              >
                {selectedPlan
                  ? `${selectedPlan.name} (${selectedPlan.installmentsCount} cuotas ${formatFrequencyLabel(
                      selectedPlan.paymentFrequency,
                    ).toLowerCase()} · ${Math.round(effectiveRate * 100)}%)`
                  : plans.length === 0
                    ? "No hay planes activos disponibles"
                    : "Seleccionar plan"}
              </button>

              {openPlan && plans.length > 0 && (
                <div className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-xl border border-white/10 bg-[#0D1B2A] shadow-xl">
                  {plans.map((p) => {
                    const rate =
                      p.financingRate !== null && p.financingRate !== undefined
                        ? Number(p.financingRate)
                        : p.financingConfiguration
                          ? Number(p.financingConfiguration.financingRate)
                          : 0;
                    return (
                      <div
                        key={p.financingPlanId}
                        onClick={() => {
                          setForm((prev) => ({
                            ...prev,
                            financingPlanId: p.financingPlanId,
                            installmentsCount: p.installmentsCount,
                            paymentFrequency: p.paymentFrequency,
                          }));
                          setOpenPlan(false);
                        }}
                        className={`cursor-pointer px-3 py-2.5 transition hover:bg-white/10 ${
                          form.financingPlanId === p.financingPlanId
                            ? "bg-[#F5A300]/15 text-[#F5A300]"
                            : "text-white"
                        }`}
                      >
                        <div className="font-medium">{p.name}</div>
                        <div className="text-xs text-white/50">
                          {p.installmentsCount} cuotas ·{" "}
                          {formatFrequencyLabel(p.paymentFrequency)} · Tasa{" "}
                          {Math.round(rate * 100)}%
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* MODO 2: PROMOCIÓN */}
        {form.saleMode === "promotion" && (
          <div className="space-y-3">
            <div className="relative">
              <label className="mb-1 block text-xs text-white/60">
                Seleccionar Promoción
              </label>
              <button
                type="button"
                onClick={() => setOpenPromo(!openPromo)}
                className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-left text-white transition hover:border-[#F5A300]/60 focus:border-[#F5A300] focus:outline-none"
              >
                {selectedPromo
                  ? `${selectedPromo.name} (${form.installmentsCount} cuotas ${formatFrequencyLabel(
                      form.paymentFrequency,
                    ).toLowerCase()} · ${Math.round(effectiveRate * 100)}%)`
                  : promotions.length === 0
                    ? "No hay promociones activas disponibles"
                    : "Seleccionar promoción"}
              </button>

              {openPromo && promotions.length > 0 && (
                <div className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-xl border border-white/10 bg-[#0D1B2A] shadow-xl">
                  {promotions.map((p) => (
                    <div
                      key={p.promotionId}
                      onClick={() => {
                        const basePlan =
                          p.plan ||
                          plans.find(
                            (pl) => pl.financingPlanId === p.financingPlanId,
                          );

                        setForm((prev) => ({
                          ...prev,
                          promotionId: p.promotionId,
                          financingPlanId: p.financingPlanId ?? "",
                          installmentsCount:
                            p.installmentsCount ??
                            basePlan?.installmentsCount ??
                            prev.installmentsCount,
                          paymentFrequency:
                            p.paymentFrequency ??
                            basePlan?.paymentFrequency ??
                            prev.paymentFrequency,
                        }));
                        setOpenPromo(false);
                      }}
                      className={`cursor-pointer px-3 py-2.5 transition hover:bg-white/10 ${
                        form.promotionId === p.promotionId
                          ? "bg-[#F5A300]/15 text-[#F5A300]"
                          : "text-white"
                      }`}
                    >
                      <div className="font-medium">{p.name}</div>
                      <div className="text-xs text-white/50">
                        {p.plan ? `Basada en: ${p.plan.name}` : "Independiente"}{" "}
                        · Ajuste: {Number(p.discountPercentage ?? 0) * 100}%
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* MODO 3: PERSONALIZADO - ELEGIR CONFIGURACIÓN O TASA MANUAL */}
        {form.saleMode === "custom" && (
          <div className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-white/70">
              Financiación Personalizada
            </p>

            {/* Sub-selector de tasa personalizada */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    customRateType: "config",
                  }))
                }
                className={`flex items-center justify-center rounded-xl px-3 py-2 text-xs font-medium transition ${
                  form.customRateType === "config"
                    ? "border border-[#F5A300]/40 bg-[#F5A300]/20 text-[#F5A300]"
                    : "border border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
                }`}
              >
                Configuración guardada
              </button>
              <button
                type="button"
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    customRateType: "custom",
                    financingConfigId: "",
                  }))
                }
                className={`flex items-center justify-center rounded-xl px-3 py-2 text-xs font-medium transition ${
                  form.customRateType === "custom"
                    ? "border border-[#F5A300]/40 bg-[#F5A300]/20 text-[#F5A300]"
                    : "border border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
                }`}
              >
                Porcentaje directo (%)
              </button>
            </div>

            {form.customRateType === "config" ? (
              <div className="relative">
                <label className="mb-1 block text-xs text-white/60">
                  Seleccionar Configuración
                </label>
                <button
                  type="button"
                  onClick={() => setOpenConfig(!openConfig)}
                  className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-left text-white transition hover:border-[#F5A300]/60 focus:border-[#F5A300] focus:outline-none"
                >
                  {selectedConfig
                    ? `${selectedConfig.name} (${Math.round(Number(selectedConfig.financingRate) * 100)}%)`
                    : configs.length === 0
                      ? "No hay configuraciones disponibles"
                      : "Seleccionar configuración (opcional, 0% por defecto)"}
                </button>

                {openConfig && configs.length > 0 && (
                  <div className="absolute z-20 mt-1 max-h-48 w-full overflow-auto rounded-xl border border-white/10 bg-[#0D1B2A] shadow-xl">
                    <div
                      onClick={() => {
                        setForm((prev) => ({
                          ...prev,
                          financingConfigId: "",
                        }));
                        setOpenConfig(false);
                      }}
                      className="cursor-pointer px-3 py-2 text-xs text-white/50 hover:bg-white/10"
                    >
                      Sin recargo (0%)
                    </div>
                    {configs.map((c) => (
                      <div
                        key={c.financingConfigId}
                        onClick={() => {
                          setForm((prev) => ({
                            ...prev,
                            financingConfigId: c.financingConfigId,
                          }));
                          setOpenConfig(false);
                        }}
                        className={`cursor-pointer px-3 py-2 text-sm transition hover:bg-white/10 ${
                          form.financingConfigId === c.financingConfigId
                            ? "bg-[#F5A300]/15 text-[#F5A300]"
                            : "text-white"
                        }`}
                      >
                        {c.name} ({Math.round(Number(c.financingRate) * 100)}%)
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div>
                <label className="mb-1 block text-xs text-white/60">
                  Porcentaje de financiación
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Ej: 0, 20 o 500"
                    value={form.customRate ?? "0"}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        customRate: e.target.value,
                      }))
                    }
                    className="h-11 border-white/10 bg-white/5 pr-10 text-white"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40">
                    %
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ---------------- SELECCIÓN DE PRODUCTO ---------------- */}
        <div className="relative">
          <label className="mb-1 block text-xs text-white/60">
            Producto{" "}
            {availableProducts.length < products.length &&
              "(Filtrado según plan/promo)"}
          </label>
          <button
            type="button"
            onClick={() => setOpenProduct(!openProduct)}
            className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-left text-white transition hover:border-[#F5A300]/60 focus:border-[#F5A300] focus:outline-none"
          >
            {selectedProduct
              ? `${selectedProduct.name} - $${Number(selectedProduct.price).toLocaleString("es-AR")}`
              : "Seleccionar producto"}
          </button>

          {openProduct && (
            <div className="absolute z-20 mt-1 max-h-52 w-full overflow-auto rounded-xl border border-white/10 bg-[#0D1B2A] shadow-xl">
              {availableProducts.length === 0 ? (
                <div className="p-3 text-xs text-white/50">
                  No hay productos habilitados
                </div>
              ) : (
                availableProducts.map((p) => (
                  <div
                    key={p.productId}
                    onClick={() => {
                      setForm((prev) => ({
                        ...prev,
                        productId: p.productId,
                      }));
                      setOpenProduct(false);
                    }}
                    className={`cursor-pointer px-3 py-2.5 transition hover:bg-white/10 ${
                      form.productId === p.productId
                        ? "bg-[#F5A300]/15 text-[#F5A300]"
                        : "text-white"
                    }`}
                  >
                    <div className="font-medium">{p.name}</div>
                    <div className="text-xs text-white/50">
                      ${Number(p.price).toLocaleString("es-AR")}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* ---------------- CANTIDAD ---------------- */}
        <div>
          <label className="mb-1 block text-xs text-white/60">Cantidad</label>
          <Input
            type="number"
            min="1"
            placeholder="Cantidad"
            value={String(form.quantity || 1)}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                quantity: Math.max(1, Number(e.target.value) || 1),
              }))
            }
            className="h-11 border-white/10 bg-white/5 text-white"
          />
        </div>

        {form.saleMode === "custom" ? (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs text-white/60">Cuotas</label>
              <Input
                type="number"
                min="1"
                step="1"
                placeholder="Ej: 15"
                value={String(form.installmentsCount || "")}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    installmentsCount: Math.max(
                      1,
                      Number.parseInt(event.target.value, 10) || 1,
                    ),
                  }))
                }
                className="h-11 border-white/10 bg-white/5 text-white"
              />
            </div>

            {/* FRECUENCIA */}
            <div className="relative">
              <label className="mb-1 block text-xs text-white/60">
                Frecuencia
              </label>
              <button
                type="button"
                onClick={() => setOpenFrequency(!openFrequency)}
                className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-left text-white transition hover:border-[#F5A300]/60 focus:border-[#F5A300] focus:outline-none"
              >
                {selectedFrequency?.label ?? form.paymentFrequency}
              </button>

              {openFrequency && (
                <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl border border-white/10 bg-[#0D1B2A] shadow-xl">
                  {frequencyOptions.map((opt) => (
                    <div
                      key={opt.value}
                      onClick={() => {
                        setForm((prev) => ({
                          ...prev,
                          paymentFrequency: opt.value,
                        }));
                        setOpenFrequency(false);
                      }}
                      className="cursor-pointer px-3 py-2 hover:bg-white/10 text-white text-sm"
                    >
                      {opt.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* RESUMEN CUOTAS / FRECUENCIA AUTOMÁTICAS DEL PLAN/PROMO */
          <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-xs text-white/80">
            <div>
              <span className="text-white/50">Esquema: </span>
              <span className="font-semibold text-white">
                {form.installmentsCount} cuotas ·{" "}
                {formatFrequencyLabel(form.paymentFrequency)}
              </span>
            </div>
            <div className="rounded-md bg-[#F5A300]/15 px-2 py-0.5 font-medium text-[#F5A300]">
              Tasa: {Math.round(effectiveRate * 100)}%
            </div>
          </div>
        )}

        {/* ---------------- TARJETA DE CÁLCULO EN TIEMPO REAL ---------------- */}
        {selectedProduct && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 space-y-2">
            <div className="flex justify-between text-xs text-white/60">
              <span>Precio de lista:</span>
              <span>
                $
                {unitPrice.toLocaleString("es-AR", {
                  minimumFractionDigits: 2,
                })}{" "}
                x {form.quantity} = $
                {baseSubtotal.toLocaleString("es-AR", {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>

            <div className="flex justify-between text-xs text-white/60">
              <span>
                Recargo financiación ({Math.round(effectiveRate * 100)}%):
              </span>
              <span className="text-[#F5A300]">
                +$
                {(totalWithFinancing - baseSubtotal).toLocaleString("es-AR", {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>

            <div className="border-t border-white/10 pt-2 flex items-baseline justify-between">
              <div>
                <p className="text-xs text-white/50">Total financiado</p>
                <p className="text-lg font-bold text-white">
                  $
                  {totalWithFinancing.toLocaleString("es-AR", {
                    minimumFractionDigits: 2,
                  })}
                </p>
              </div>

              <div className="text-right">
                <p className="text-xs text-white/50">
                  {form.installmentsCount} cuotas de
                </p>
                <p className="text-lg font-bold text-[#F5A300]">
                  $
                  {installmentAmount.toLocaleString("es-AR", {
                    minimumFractionDigits: 2,
                  })}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ---------------- SUBMIT ---------------- */}
        <button
          type="button"
          onClick={() => setOpenConfirm(true)}
          disabled={loading || !form.productId}
          className="w-full rounded-xl bg-[#F5A300] py-3 font-semibold text-[#0D1B2A] transition hover:bg-[#F5A300]/90 disabled:opacity-50"
        >
          {loading ? "Enviando..." : "Confirmar venta"}
        </button>

        <ConfirmDialog
          open={openConfirm}
          onOpenChange={setOpenConfirm}
          title="Confirmar venta"
          description={saleDescription}
          confirmText="Confirmar"
          cancelText="Cancelar"
          loading={loading}
          onConfirm={() => {
            setOpenConfirm(false);
            handleSubmit();
          }}
        />
      </div>
    </section>
  );
}
