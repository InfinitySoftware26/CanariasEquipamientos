"use client";

import { useEffect, useState } from "react";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  FinancingConfig,
  UpdateFinancingPayload,
} from "@/types/financing/financing.types";

interface Props {
  config: FinancingConfig;
  saving: boolean;
  onSave: (payload: UpdateFinancingPayload) => Promise<void>;
}

interface FormState {
  rate3: string;
  rate6: string;
  rate9: string;
  maxInstallments: string;
}

function toPercentString(rate: number) {
  return String(Math.round(rate * 10000) / 100);
}

function buildForm(config: FinancingConfig): FormState {
  return {
    rate3: toPercentString(config.rate3),
    rate6: toPercentString(config.rate6),
    rate9: toPercentString(config.rate9),
    maxInstallments: String(config.maxInstallments),
  };
}

export function FinancingConfigForm({ config, saving, onSave }: Props) {
  const [form, setForm] = useState<FormState>(() => buildForm(config));
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    setForm(buildForm(config));
  }, [config]);

  const set = (key: keyof FormState, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setSuccess(false);
  };

  const dirty = JSON.stringify(form) !== JSON.stringify(buildForm(config));

  function validate(): UpdateFinancingPayload | null {
    const rate3 = Number(form.rate3);
    const rate6 = Number(form.rate6);
    const rate9 = Number(form.rate9);
    const maxInstallments = Number(form.maxInstallments);

    if (
      [rate3, rate6, rate9].some(
        (rate) => !Number.isFinite(rate) || rate < 0 || rate > 100,
      )
    ) {
      setError("Las tasas deben ser porcentajes entre 0 y 100.");
      return null;
    }

    if (
      !Number.isInteger(maxInstallments) ||
      maxInstallments < 1 ||
      maxInstallments > 24
    ) {
      setError(
        "La cantidad máxima de cuotas debe ser un número entero entre 1 y 24.",
      );
      return null;
    }

    return {
      rate3: rate3 / 100,
      rate6: rate6 / 100,
      rate9: rate9 / 100,
      maxInstallments,
    };
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    setError(null);
    setSuccess(false);

    if (!validate()) {
      return;
    }

    setConfirmOpen(true);
  }

  async function handleConfirm() {
    const payload = validate();

    if (!payload) {
      setConfirmOpen(false);
      return;
    }

    try {
      await onSave(payload);

      setConfirmOpen(false);
      setSuccess(true);
    } catch (err) {
      console.error("Error guardando configuración de financiación:", err);

      setConfirmOpen(false);

      setError(
        err instanceof Error
          ? err.message
          : "No se pudo guardar la configuración.",
      );
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl sm:p-8"
    >
      <div>
        <h2 className="text-xl font-bold text-white">
          Configuración de tasas
        </h2>

        <p className="mt-1 text-sm text-white/60">
          Definí la tasa de interés aplicada según la cantidad de cuotas.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-sm text-green-300">
          Configuración guardada correctamente.
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <RateField
          label="Tasa 3 cuotas"
          value={form.rate3}
          onChange={(value) => set("rate3", value)}
        />

        <RateField
          label="Tasa 6 cuotas"
          value={form.rate6}
          onChange={(value) => set("rate6", value)}
        />

        <RateField
          label="Tasa 9 cuotas"
          value={form.rate9}
          onChange={(value) => set("rate9", value)}
        />

        <div>
          <label className="mb-2 block text-sm text-white/70">
            Cantidad máxima de cuotas
          </label>

          <input
            type="number"
            min={1}
            max={24}
            step={1}
            value={form.maxInstallments}
            onChange={(e) => set("maxInstallments", e.target.value)}
            className="w-full rounded-xl bg-slate-900 p-3 text-white outline-none ring-1 ring-white/10 focus:ring-[#F5A300]"
          />
        </div>
      </div>

      <div className="flex justify-end border-t border-white/10 pt-5">
        <button
          type="submit"
          disabled={saving || !dirty}
          className="rounded-xl bg-[#F5A300] px-5 py-3 font-semibold text-black transition hover:bg-[#ffb21c] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="¿Guardar cambios?"
        description="Se actualizará la configuración de financiación para toda la sociedad."
        confirmText="Guardar"
        loading={saving}
        onConfirm={handleConfirm}
      />
    </form>
  );
}

function RateField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm text-white/70">{label}</label>

      <div className="relative">
        <input
          type="number"
          min={0}
          max={100}
          step={0.01}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl bg-slate-900 p-3 pr-10 text-white outline-none ring-1 ring-white/10 focus:ring-[#F5A300]"
        />

        <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-white/40">
          %
        </span>
      </div>
    </div>
  );
}
