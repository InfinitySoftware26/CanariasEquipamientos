"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPayment } from "@/services/payments/payments.service";
import {
  CreatePaymentPayload,
  PaymentMethod,
} from "@/types/payments/payment.types";

const METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "cash", label: "Efectivo" },
  { value: "transfer", label: "Transferencia" },
  { value: "debit_card", label: "Débito" },
  { value: "credit_card", label: "Crédito" },
  { value: "mercado_pago", label: "Mercado Pago" },
  { value: "check", label: "Cheque" },
];

export function PaymentForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    saleId: "",
    clientId: "",
    amount: "",
    method: "cash" as PaymentMethod,
    installmentId: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false),
    [error, setError] = useState("");
  const set = (key: keyof typeof form, value: string) =>
    setForm((x) => ({ ...x, [key]: value }));
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const amount = Number(form.amount);
    if (!form.saleId.trim() || !form.clientId.trim()) {
      setError("Ingresá la venta y el cliente.");
      return;
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      setError("El monto debe ser mayor a cero.");
      return;
    }
    const payload: CreatePaymentPayload = {
      saleId: form.saleId.trim(),
      clientId: form.clientId.trim(),
      amount,
      method: form.method,
    };
    if (form.installmentId.trim())
      payload.installmentId = form.installmentId.trim();
    if (form.notes.trim()) payload.notes = form.notes.trim();
    try {
      setLoading(true);
      await createPayment(payload);
      router.push("/payments");
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo registrar el pago");
    } finally {
      setLoading(false);
    }
  }
  return (
    <form
      onSubmit={submit}
      className="space-y-6 rounded-3xl border border-white/10 bg-[#0E1726] p-6 sm:p-8"
    >
      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          {error}
        </div>
      )}
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm text-white/70">
            ID de venta
          </label>
          <input
            required
            value={form.saleId}
            onChange={(e) => set("saleId", e.target.value)}
            placeholder="UUID de la venta"
            className="w-full rounded-xl bg-slate-900 p-3 text-white outline-none ring-1 ring-white/10 focus:ring-[#F5A300]"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm text-white/70">
            ID de cliente
          </label>
          <input
            required
            value={form.clientId}
            onChange={(e) => set("clientId", e.target.value)}
            placeholder="UUID del cliente"
            className="w-full rounded-xl bg-slate-900 p-3 text-white outline-none ring-1 ring-white/10 focus:ring-[#F5A300]"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm text-white/70">Monto</label>
          <input
            required
            type="number"
            min="0.01"
            step="0.01"
            value={form.amount}
            onChange={(e) => set("amount", e.target.value)}
            placeholder="0,00"
            className="w-full rounded-xl bg-slate-900 p-3 text-white outline-none ring-1 ring-white/10 focus:ring-[#F5A300]"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm text-white/70">
            Método de pago
          </label>
          <select
            value={form.method}
            onChange={(e) => set("method", e.target.value)}
            className="w-full rounded-xl bg-slate-900 p-3 text-white outline-none ring-1 ring-white/10 focus:ring-[#F5A300]"
          >
            {METHODS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="mb-2 block text-sm text-white/70">
            ID de cuota <span className="text-white/40">(opcional)</span>
          </label>
          <input
            value={form.installmentId}
            onChange={(e) => set("installmentId", e.target.value)}
            placeholder="Si se completa, se imputa automáticamente"
            className="w-full rounded-xl bg-slate-900 p-3 text-white outline-none ring-1 ring-white/10 focus:ring-[#F5A300]"
          />
        </div>
        <div className="md:col-span-2">
          <label className="mb-2 block text-sm text-white/70">
            Observaciones
          </label>
          <textarea
            rows={4}
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
            className="w-full resize-none rounded-xl bg-slate-900 p-3 text-white outline-none ring-1 ring-white/10 focus:ring-[#F5A300]"
          />
        </div>
      </div>
      <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-5 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-xl border border-white/10 px-5 py-3 font-medium text-white"
        >
          Cancelar
        </button>
        <button
          disabled={loading}
          className="rounded-xl bg-[#F5A300] px-5 py-3 font-semibold text-black disabled:opacity-50"
        >
          {loading ? "Registrando..." : "Registrar pago"}
        </button>
      </div>
    </form>
  );
}
