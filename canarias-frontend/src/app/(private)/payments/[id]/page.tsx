"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  getPayment,
  getPaymentApplications,
  applyPayment,
} from "@/services/payments/payments.service";
import { Payment, PaymentApplication } from "@/types/payments/payment.types";
import { FormEvent } from "react";
export default function PaymentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [payment, setPayment] = useState<Payment | null>(null);
  const [apps, setApps] = useState<PaymentApplication[]>([]);
  const [error, setError] = useState("");
  const [installmentId, setInstallmentId] = useState("");
  const [amount, setAmount] = useState("");
  const [saving, setSaving] = useState(false);
  const loadApps = () => getPaymentApplications(id).then(setApps);
  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!installmentId.trim() || Number(amount) <= 0) return;
    try {
      setSaving(true);
      await applyPayment(id, {
        applications: [
          { installmentId: installmentId.trim(), amount: Number(amount) },
        ],
      });
      setInstallmentId("");
      setAmount("");
      await loadApps();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo imputar el pago");
    } finally {
      setSaving(false);
    }
  }
  useEffect(() => {
    if (!id) return;
    Promise.all([getPayment(id), getPaymentApplications(id)])
      .then(([p, a]) => {
        setPayment(p);
        setApps(a);
      })
      .catch((e) =>
        setError(e instanceof Error ? e.message : "No se pudo cargar el pago"),
      );
  }, [id]);
  if (error) return <div className="text-red-300">{error}</div>;
  if (!payment) return <div className="text-white/60">Cargando pago...</div>;
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-white">Detalle de pago</h1>
        <p className="mt-2 font-mono text-xs text-white/40">
          {payment.paymentId}
        </p>
      </header>
      <section className="grid gap-4 md:grid-cols-3">
        {[
          [
            "Importe",
            `$ ${Number(payment.amount).toLocaleString("es-AR", { minimumFractionDigits: 2 })}`,
          ],
          ["Método", payment.method.replaceAll("_", " ")],
          ["Fecha", new Date(payment.paymentDate).toLocaleString("es-AR")],
        ].map(([a, b]) => (
          <div
            key={a}
            className="rounded-2xl border border-white/10 bg-[#0E1726] p-5"
          >
            <p className="text-sm text-white/50">{a}</p>
            <p className="mt-2 text-xl font-bold capitalize text-white">{b}</p>
          </div>
        ))}
      </section>
      <section className="rounded-2xl border border-white/10 bg-[#0E1726] p-6">
        <h2 className="text-xl font-semibold text-white">Imputaciones</h2>
        {apps.length === 0 ? (
          <p className="mt-4 text-white/50">
            Este pago todavía no tiene cuotas imputadas.
          </p>
        ) : (
          <div className="mt-4 space-y-2">
            {apps.map((a) => (
              <div
                key={a.installmentId}
                className="flex justify-between rounded-xl bg-white/5 p-4 text-white"
              >
                <span>Cuota #{a.installmentNumber}</span>
                <strong>
                  ${Number(a.amountApplied).toLocaleString("es-AR")}
                </strong>
              </div>
            ))}
          </div>
        )}
      </section>
      <section className="rounded-2xl border border-white/10 bg-[#0E1726] p-6">
        <h2 className="text-xl font-semibold text-white">Imputación manual</h2>
        <form
          onSubmit={submit}
          className="mt-4 grid gap-3 md:grid-cols-[1fr_180px_auto]"
        >
          <input
            value={installmentId}
            onChange={(e) => setInstallmentId(e.target.value)}
            placeholder="UUID de cuota"
            className="rounded-xl bg-slate-900 p-3 text-white"
          />
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Monto"
            className="rounded-xl bg-slate-900 p-3 text-white"
          />
          <button
            disabled={saving}
            className="rounded-xl bg-[#F5A300] px-5 py-3 font-semibold text-black"
          >
            {saving ? "Guardando..." : "Imputar"}
          </button>
        </form>
        <p className="mt-3 text-xs text-white/40">
          El backend valida que el monto imputado no supere el saldo disponible
          del pago ni de la cuota.
        </p>
      </section>
    </div>
  );
}
