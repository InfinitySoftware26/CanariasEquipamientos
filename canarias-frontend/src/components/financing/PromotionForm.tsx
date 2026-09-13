"use client";

import { useState } from "react";

import { SaveButton } from "@/components/button/SaveButton";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { FormField } from "@/components/ui/formField";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Product } from "@/types/preload-sale/preload.type";
import {
  FinancingPlan,
  PAYMENT_FREQUENCY_OPTIONS,
  PaymentFrequency,
} from "@/types/financing/financing.types";
import { FinancingProductsSelector } from "./FinancingProductSelector";

interface PromotionFormState {
  name: string;
  financingPlanId: string;
  discountPercentage: string;
  paymentFrequency: PaymentFrequency;
  installmentsCount: string;
  isGlobal: boolean;
  productIds: string[];
}

interface PromotionFormProps {
  form: PromotionFormState;
  updateField: <K extends keyof PromotionFormState>(
    field: K,
    value: PromotionFormState[K],
  ) => void;
  plans: FinancingPlan[];
  products: Product[];
  handleSubmit: () => Promise<void>;
  loading: boolean;
  error?: string | null;
  errors: Record<string, string>;
  mode: "create" | "edit";
}

const NO_PLAN_VALUE = "__none__";

export function PromotionForm({
  form,
  updateField,
  plans,
  products,
  handleSubmit,
  loading,
  error,
  errors,
  mode,
}: PromotionFormProps) {
  const [openConfirm, setOpenConfirm] = useState(false);
  const hasPlan = Boolean(form.financingPlanId);

  const title = mode === "create" ? "Nueva promoción" : "Editar promoción";
  const submitLabel = mode === "create" ? "Crear promoción" : "Guardar cambios";

  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
      <h2 className="mb-6 text-2xl font-bold text-white">{title}</h2>

      <div className="space-y-5">
        <FormField label="Nombre" error={errors.name}>
          <Input
            placeholder="Ej: Promo agosto"
            value={form.name}
            onChange={(event) => updateField("name", event.target.value)}
            className="h-11 border-white/10 bg-white/5 text-white"
          />
        </FormField>

        <FormField label="Plan de financiación (opcional)">
          <Select
            value={form.financingPlanId || NO_PLAN_VALUE}
            onValueChange={(value) =>
              updateField(
                "financingPlanId",
                value === NO_PLAN_VALUE ? "" : value,
              )
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Promoción independiente" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NO_PLAN_VALUE}>
                Promoción independiente
              </SelectItem>
              {plans.map((plan) => (
                <SelectItem
                  key={plan.financingPlanId}
                  value={plan.financingPlanId}
                >
                  {plan.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>

        <FormField
          label="Descuento sobre la tasa"
          error={errors.discountPercentage}
        >
          <div className="relative">
            <Input
              type="number"
              step="0.01"
              placeholder="Ej: 5 (descuento) o -5 (recargo)"
              value={form.discountPercentage}
              onChange={(event) =>
                updateField("discountPercentage", event.target.value)
              }
              className="h-11 border-white/10 bg-white/5 pr-10 text-white"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40">
              %
            </span>
          </div>
        </FormField>

        {!hasPlan && (
          <>
            <FormField label="Frecuencia de pago">
              <Select
                value={form.paymentFrequency}
                onValueChange={(value) =>
                  updateField("paymentFrequency", value as PaymentFrequency)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccioná una frecuencia" />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_FREQUENCY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField label="Cantidad de cuotas">
              <Input
                type="number"
                min="1"
                placeholder="Ej: 6"
                value={form.installmentsCount}
                onChange={(event) =>
                  updateField("installmentsCount", event.target.value)
                }
                className="h-11 border-white/10 bg-white/5 text-white"
              />
            </FormField>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-white">Promoción global</p>
                  <p className="mt-1 text-sm text-white/50">
                    Se aplicará a todos los productos de la sociedad.
                  </p>
                </div>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => updateField("isGlobal", !form.isGlobal)}
                  className={`relative h-6 w-11 rounded-full transition ${
                    form.isGlobal ? "bg-[#F5A300]" : "bg-white/20"
                  } disabled:opacity-50`}
                >
                  <span
                    className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                      form.isGlobal ? "left-6" : "left-1"
                    }`}
                  />
                </button>
              </div>
            </div>

            {!form.isGlobal && (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <FinancingProductsSelector
                  products={products}
                  selectedProductIds={form.productIds}
                  onChange={(productIds) =>
                    updateField("productIds", productIds)
                  }
                  disabled={loading}
                  error={errors.productIds}
                />
              </div>
            )}
          </>
        )}

        {error && (
          <p className="rounded-lg bg-red-500/10 p-3 text-sm text-red-400">
            {error}
          </p>
        )}

        <SaveButton
          onClick={() => setOpenConfirm(true)}
          disabled={loading}
          className="mt-4 w-full"
        >
          {loading ? "Guardando..." : submitLabel}
        </SaveButton>

        <ConfirmDialog
          open={openConfirm}
          onOpenChange={setOpenConfirm}
          title={
            mode === "create" ? "¿Crear nueva promoción?" : "¿Guardar cambios?"
          }
          description={
            mode === "create"
              ? "Se creará una nueva promoción de financiación."
              : "Se guardarán los cambios realizados en la promoción."
          }
          confirmText={submitLabel}
          cancelText="Cancelar"
          loading={loading}
          onConfirm={handleSubmit}
        />
      </div>
    </section>
  );
}
