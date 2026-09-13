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
  FinancingConfiguration,
  PAYMENT_FREQUENCY_OPTIONS,
  PaymentFrequency,
} from "@/types/financing/financing.types";
import { FinancingProductsSelector } from "./FinancingProductSelector";

interface FinancingPlanFormState {
  name: string;
  financingConfigId: string;
  paymentFrequency: PaymentFrequency;
  installmentsCount: string;
  isGlobal: boolean;
  productIds: string[];
}

interface FinancingPlanFormProps {
  form: FinancingPlanFormState;
  updateField: <K extends keyof FinancingPlanFormState>(
    field: K,
    value: FinancingPlanFormState[K],
  ) => void;
  configs: FinancingConfiguration[];
  products: Product[];
  handleSubmit: () => Promise<void>;
  loading: boolean;
  error?: string | null;
  errors: Record<string, string>;
  mode: "create" | "edit";
}

export function FinancingPlanForm({
  form,
  updateField,
  configs,
  products,
  handleSubmit,
  loading,
  error,
  errors,
  mode,
}: FinancingPlanFormProps) {
  const [openConfirm, setOpenConfirm] = useState(false);

  const title =
    mode === "create"
      ? "Nuevo plan de financiación"
      : "Editar plan de financiación";
  const submitLabel = mode === "create" ? "Crear plan" : "Guardar cambios";

  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
      <h2 className="mb-6 text-2xl font-bold text-white">{title}</h2>

      <div className="space-y-5">
        <FormField label="Nombre" error={errors.name}>
          <Input
            placeholder="Ej: 3 cuotas mensuales"
            value={form.name}
            onChange={(event) => updateField("name", event.target.value)}
            className="h-11 border-white/10 bg-white/5 text-white"
          />
        </FormField>

        <FormField
          label="Configuración de financiación"
          error={errors.financingConfigId}
        >
          <Select
            value={form.financingConfigId}
            onValueChange={(value) => updateField("financingConfigId", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccioná una configuración" />
            </SelectTrigger>
            <SelectContent>
              {configs.map((config) => (
                <SelectItem
                  key={config.financingConfigId}
                  value={config.financingConfigId}
                >
                  {config.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>

        <FormField label="Frecuencia de pago" error={errors.paymentFrequency}>
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

        <FormField label="Cantidad de cuotas" error={errors.installmentsCount}>
          <Input
            type="number"
            min="1"
            placeholder="Ej: 3"
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
              <p className="font-medium text-white">Plan global</p>
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
              onChange={(productIds) => updateField("productIds", productIds)}
              disabled={loading}
              error={errors.productIds}
            />
          </div>
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
          title={mode === "create" ? "¿Crear nuevo plan?" : "¿Guardar cambios?"}
          description={
            mode === "create"
              ? "Se creará un nuevo plan de financiación."
              : "Se guardarán los cambios realizados en el plan de financiación."
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
