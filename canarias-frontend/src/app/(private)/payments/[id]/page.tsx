"use client";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  getPayment,
  getPaymentApplications,
  applyPayment,
} from "@/services/payments/payments.service";
import { getInstallmentsByClient } from "@/services/installments/installments.service";
import { Payment, PaymentApplication } from "@/types/payments/payment.types";
import { Installment } from "@/types/installments/installment.types";
import { FormEvent } from "react";

const PENDING_STATUSES = new Set<Installment["status"]>([
  "pending",
  "overdue",
  "partial",
]);

export default function PaymentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [payment, setPayment] = useState<Payment | null>(null);
  const [apps, setApps] = useState<PaymentApplication[]>([]);
  const [pendingInstallments, setPendingInstallments] = useState<Installment[]>(
    [],
  );
  const [error, setError] = useState("");
  const [installmentId, setInstallmentId] = useState("");
  const [amount, setAmount] = useState("");
  const [saving, setSaving] = useState(false);
  const [applyError, setApplyError] = useState("");

  const loadApps = () => getPaymentApplications(id).then(setApps);

  const appliedTotal = useMemo(
    () => apps.reduce((sum, a) => sum + Number(a.amountApplied), 0),
    [apps],
  );

  const availableBalance = payment ? Number(payment.amount) - appliedTotal : 0;

  const selectedInstallment = pendingInstallments.find(
    (i) => i.installmentId === installmentId,
  );

  const maxApplicable = selectedInstallment
    ? Math.min(Number(selectedInstallment.remainingAmount), availableBalance)
    : availableBalance;

  async function submit(e: FormEvent) {
    e.preventDefault();
    setApplyError("");

    const value = Number(amount);

    if (!installmentId.trim()) {
      setApplyError("Elegí una cuota para imputar.");
      return;
    }

    if (!Number.isFinite(value) || value <= 0) {
      setApplyError("El monto debe ser mayor a cero.");
      return;
    }

    if (value > maxApplicable + 0.009) {
      setApplyError(
        `El monto no puede superar $ ${maxApplicable.toLocaleString("es-AR", { minimumFractionDigits: 2 })} (saldo disponible entre el pago y la cuota).`,
      );
      return;
    }

    try {
      setSaving(true);
      await applyPayment(id, {
        applications: [{ installmentId: installmentId.trim(), amount: value }],
      });
      setInstallmentId("");
      setAmount("");
      await loadApps();

      const refreshedInstallments = await getInstallmentsByClient(
        payment!.clientId,
      );
      setPendingInstallments(
        refreshedInstallments.filter((i) => PENDING_STATUSES.has(i.status)),
      );
    } catch (e) {
      setApplyError(
        e instanceof Error ? e.message : "No se pudo imputar el pago",
      );
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    if (!id) return;
    Promise.all([getPayment(id), getPaymentApplications(id)])
      .then(async ([p, a]) => {
        setPayment(p);
        setApps(a);

        const installments = await getInstallmentsByClient(p.clientId);
        setPendingInstallments(
          installments.filter((i) => PENDING_STATUSES.has(i.status)),
        );
      })
      .catch((e) =>
        setError(e instanceof Error ? e.message : "No se pudo cargar el pago"),
      );
  }, [id]);

  useEffect(() => {
    if (!selectedInstallment) {
      setAmount("");
      return;
    }

    const suggested = Math.min(
      Number(selectedInstallment.remainingAmount),
      availableBalance,
    );

    setAmount(suggested > 0 ? suggested.toFixed(2) : "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [installmentId]);

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
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-xl font-semibold text-white">
            Imputación manual
          </h2>

          <span className="rounded-lg bg-white/5 px-3 py-1.5 text-sm text-white/70">
            Saldo disponible del pago: $
            {availableBalance.toLocaleString("es-AR", {
              minimumFractionDigits: 2,
            })}
          </span>
        </div>

        {applyError && (
          <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {applyError}
          </div>
        )}

        {pendingInstallments.length === 0 ? (
          <p className="mt-4 text-white/50">
            Este cliente no tiene cuotas pendientes para imputar.
          </p>
        ) : availableBalance <= 0 ? (
          <p className="mt-4 text-white/50">
            Este pago ya no tiene saldo disponible para imputar.
          </p>
        ) : (
          <form
            onSubmit={submit}
            className="mt-4 grid gap-3 md:grid-cols-[1fr_180px_auto]"
          >
            <select
              value={installmentId}
              onChange={(e) => setInstallmentId(e.target.value)}
              className="rounded-xl bg-slate-900 p-3 text-white outline-none focus:border focus:border-[#F5A300]"
            >
              <option value="">Elegí una cuota...</option>
              {pendingInstallments.map((installment) => (
                <option
                  key={installment.installmentId}
                  value={installment.installmentId}
                >
                  Cuota #{installment.installmentNumber} — Saldo: $
                  {Number(installment.remainingAmount).toLocaleString("es-AR", {
                    minimumFractionDigits: 2,
                  })}
                </option>
              ))}
            </select>

            <input
              type="number"
              min="0.01"
              step="0.01"
              max={maxApplicable > 0 ? maxApplicable : undefined}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Monto"
              className="rounded-xl bg-slate-900 p-3 text-white"
            />

            <button
              disabled={saving || !installmentId}
              className="rounded-xl bg-[#F5A300] px-5 py-3 font-semibold text-black transition disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Guardando..." : "Imputar"}
            </button>
          </form>
        )}

        <p className="mt-3 text-xs text-white/40">
          El monto se sugiere automáticamente como el menor entre el saldo de la
          cuota y el saldo disponible del pago; podés ajustarlo manualmente. El
          backend valida igualmente que no se supere ninguno de los dos límites.
        </p>
      </section>
    </div>
  );
}
