"use client";

import { useState } from "react";

import { SaveButton } from "@/components/button/SaveButton";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { FormField } from "@/components/ui/formField";
import { Input } from "@/components/ui/input";
import { Product } from "@/types/preload-sale/preload.type";
import { FinancingProductsSelector } from "./FinancingProductSelector";

interface FinancingConfigFormState {
  name: string;
  financingRate: string;
  isGlobal: boolean;
  isActive: boolean;
  productIds: string[];
}

interface FinancingConfigFormProps {
  form: FinancingConfigFormState;
  updateField: <K extends keyof FinancingConfigFormState>(
    field: K,
    value: FinancingConfigFormState[K],
  ) => void;
  products: Product[];
  handleSubmit: () => Promise<void>;
  loading: boolean;
  error?: string | null;
  errors: Record<string, string>;
  mode: "create" | "edit";
}

export function FinancingConfigForm({
  form,
  updateField,
  products,
  handleSubmit,
  loading,
  error,
  errors,
  mode,
}: FinancingConfigFormProps) {
  const [openConfirm, setOpenConfirm] = useState(false);

  const title =
    mode === "create" ? "Nueva configuración" : "Editar configuración";
  const submitLabel =
    mode === "create" ? "Crear configuración" : "Guardar cambios";

  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
      <h2 className="mb-6 text-2xl font-bold text-white">{title}</h2>

      <div className="space-y-5">
        <FormField label="Nombre" error={errors.name}>
          <Input
            placeholder="Ej: Financiación estándar"
            value={form.name}
            onChange={(event) => updateField("name", event.target.value)}
            className="h-11 border-white/10 bg-white/5 text-white"
          />
        </FormField>

        <FormField label="Tasa de financiación" error={errors.financingRate}>
          <div className="relative">
            <Input
              type="number"
              min="0"
              step="0.01"
              placeholder="Ej: 12"
              value={form.financingRate}
              onChange={(event) =>
                updateField("financingRate", event.target.value)
              }
              className="h-11 border-white/10 bg-white/5 pr-10 text-white"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40">
              %
            </span>
          </div>
        </FormField>

        {mode === "edit" && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-medium text-white">Activa</p>
                <p className="mt-1 text-sm text-white/50">
                  Las configuraciones inactivas no se pueden usar en nuevos
                  planes.
                </p>
              </div>
              <button
                type="button"
                disabled={loading}
                onClick={() => updateField("isActive", !form.isActive)}
                className={`relative h-6 w-11 rounded-full transition ${
                  form.isActive ? "bg-[#F5A300]" : "bg-white/20"
                } disabled:opacity-50`}
              >
                <span
                  className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                    form.isActive ? "left-6" : "left-1"
                  }`}
                />
              </button>
            </div>
          </div>
        )}

        {mode === "create" && (
          <>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-white">Configuración global</p>
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
            mode === "create"
              ? "¿Crear nueva configuración?"
              : "¿Guardar cambios?"
          }
          description={
            mode === "create"
              ? "Se creará una nueva configuración de financiación para la sociedad seleccionada."
              : "Se guardarán los cambios realizados en la configuración de financiación."
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
