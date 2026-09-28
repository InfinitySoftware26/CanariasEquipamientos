"use client";

import { useEffect, useState } from "react";

import { Installment } from "@/types/installments/installment.types";

interface Props {
  installment: Installment | null;
  loading: boolean;
  onClose: () => void;
  onSubmit: (installmentId: string, amount: number) => Promise<void>;
}

export function PayInstallmentModal({
  installment,
  loading,
  onClose,
  onSubmit,
}: Props) {
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!installment) {
      return;
    }

    setAmount(String(installment.remainingAmount));
    setError(null);
  }, [installment]);

  if (!installment) {
    return null;
  }

  const remaining = Number(installment.remainingAmount);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const value = Number(amount);

    if (!Number.isFinite(value) || value <= 0) {
      setError("El monto debe ser mayor a cero.");
      return;
    }

    if (value > remaining) {
      setError("El monto no puede superar el saldo pendiente de la cuota.");
      return;
    }

    try {
      setError(null);

      await onSubmit(installment!.installmentId, value);
    } catch (err) {
      console.error("Error registrando pago de cuota:", err);

      setError(
        err instanceof Error
          ? err.message
          : "No se pudo registrar el pago de la cuota.",
      );
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0E1726] p-6 shadow-2xl">
        <div>
          <h2 className="text-xl font-bold text-white">Registrar pago</h2>

          <p className="mt-2 text-sm text-white/50">
            Cuota #{installment.installmentNumber} · Saldo pendiente: $
            {remaining.toLocaleString()}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="payAmount"
              className="mb-2 block text-sm font-medium text-white"
            >
              Monto a pagar
            </label>

            <input
              id="payAmount"
              type="number"
              min="0.01"
              max={remaining}
              step="0.01"
              required
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-[#F5A300]"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl border border-white/10 px-4 py-2.5 font-medium text-white transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-[#F5A300] px-4 py-2.5 font-semibold text-black transition hover:bg-[#ffb21c] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Registrando..." : "Registrar pago"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
