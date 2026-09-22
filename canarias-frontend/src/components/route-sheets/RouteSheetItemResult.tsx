"use client";

import { useEffect, useMemo, useState } from "react";

import { RouteSheetItem } from "@/types/rotue-sheets/routeSheets.types";

import { updateRouteSheetItem } from "@/services/route-sheets/routeSheetsItems.service";

import { SaveButton } from "@/components/button/SaveButton";

import { DangerButton } from "@/components/button/DangerButton";

export type FailedVisitReason =
  | "client_absent"
  | "refused_payment"
  | "wrong_address"
  | "other";

export interface RouteSheetItemResultData {
  result: "completed" | "failed";

  collectedAmount?: number;

  notes?: string;

  failedVisitReason?: FailedVisitReason;

  productDelivered?: boolean;

  paymentReceived?: boolean;
}

interface Props {
  item: RouteSheetItem;

  open: boolean;

  onOpenChange: (open: boolean) => void;

  onSuccess?: () => void;
}

function formatCurrency(value: number | null | undefined) {
  return `$${Number(value ?? 0).toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function RouteSheetItemResult({
  item,
  open,
  onOpenChange,
  onSuccess,
}: Props) {
  const [loading, setLoading] = useState(false);

  const [collectedAmount, setCollectedAmount] = useState("");

  const [notes, setNotes] = useState("");

  const [failedVisitReason, setFailedVisitReason] = useState<
    FailedVisitReason | ""
  >("");

  const [productDelivered, setProductDelivered] = useState(false);

  const [paymentReceived, setPaymentReceived] = useState(false);

  const isInstallment = item.itemType === "installment";

  const isDelivery = item.itemType === "delivery";

  const hasInstallment = Boolean(item.installmentId);

  const requiresPayment = isInstallment || (isDelivery && hasInstallment);

  const remainingAmount = Number(
    item.installmentRemainingAmount ?? item.installmentAmount ?? 0,
  );

  const lateInterestAmount = Number(item.lateInterestAmount ?? 0);

  const totalToCollect = Number(
    item.totalToCollect ?? remainingAmount + lateInterestAmount,
  );

  const numericCollectedAmount = Number(collectedAmount || 0);

  const amountIsValid =
    !requiresPayment ||
    (numericCollectedAmount > 0 && numericCollectedAmount <= totalToCollect);

  const canComplete = useMemo(() => {
    if (isInstallment) {
      return amountIsValid;
    }

    if (isDelivery) {
      if (!productDelivered) {
        return false;
      }

      if (hasInstallment) {
        return paymentReceived && amountIsValid;
      }

      return true;
    }

    return false;
  }, [
    isInstallment,
    isDelivery,
    hasInstallment,
    productDelivered,
    paymentReceived,
    amountIsValid,
  ]);

  useEffect(() => {
    if (!open) {
      return;
    }

    setCollectedAmount(requiresPayment ? String(totalToCollect) : "");

    setNotes("");

    setFailedVisitReason("");

    setProductDelivered(false);

    setPaymentReceived(false);
  }, [open, requiresPayment, totalToCollect]);

  async function handleComplete() {
    if (!canComplete) {
      return;
    }

    try {
      setLoading(true);

      const payload: RouteSheetItemResultData = {
        result: "completed",

        collectedAmount: requiresPayment ? numericCollectedAmount : undefined,

        notes: notes.trim() || undefined,

        productDelivered: isDelivery ? productDelivered : undefined,

        paymentReceived:
          isDelivery && hasInstallment ? paymentReceived : undefined,
      };

      await updateRouteSheetItem(item.itemId, payload);

      onOpenChange(false);

      onSuccess?.();
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "No se pudo registrar el resultado.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleFailed() {
    if (!failedVisitReason) {
      alert("Debe seleccionar el motivo de la visita fallida.");

      return;
    }

    try {
      setLoading(true);

      const payload: RouteSheetItemResultData = {
        result: "failed",

        failedVisitReason,

        notes: notes.trim() || undefined,

        productDelivered: isDelivery ? false : undefined,

        paymentReceived: isDelivery ? false : undefined,
      };

      await updateRouteSheetItem(item.itemId, payload);

      onOpenChange(false);

      onSuccess?.();
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "No se pudo registrar la visita fallida.",
      );
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/10 bg-[#111827] shadow-2xl">
        {/* HEADER */}

        <div className="border-b border-white/10 px-6 py-5">
          <h2 className="text-xl font-semibold text-white">
            {isDelivery
              ? hasInstallment
                ? "Registrar entrega + cuota 1"
                : "Registrar entrega"
              : "Registrar cobranza"}
          </h2>

          <p className="mt-1 text-sm text-white/50">
            {item.clientName ?? "Cliente"}
          </p>
        </div>

        <div className="space-y-6 p-6">
          {/* RESUMEN COBRO */}

          {requiresPayment && (
            <section className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-5">
              <h3 className="font-semibold text-white">Detalle del cobro</h3>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl bg-black/20 p-3">
                  <p className="text-xs text-white/40">Capital pendiente</p>

                  <p className="mt-1 font-semibold text-white">
                    {formatCurrency(remainingAmount)}
                  </p>
                </div>

                <div className="rounded-xl bg-black/20 p-3">
                  <p className="text-xs text-white/40">Mora</p>

                  <p
                    className={`mt-1 font-semibold ${
                      lateInterestAmount > 0 ? "text-red-300" : "text-white"
                    }`}
                  >
                    {formatCurrency(lateInterestAmount)}
                  </p>

                  {Number(item.daysLate ?? 0) > 0 && (
                    <p className="mt-1 text-xs text-red-300/70">
                      {item.daysLate}{" "}
                      {Number(item.daysLate) === 1 ? "día" : "días"} de atraso
                    </p>
                  )}
                </div>

                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3">
                  <p className="text-xs text-white/40">Total a cobrar</p>

                  <p className="mt-1 text-lg font-bold text-emerald-300">
                    {formatCurrency(totalToCollect)}
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* ENTREGA */}

          {isDelivery && (
            <section className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-5">
              <h3 className="font-semibold text-white">
                Confirmación de entrega
              </h3>

              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-black/10 p-4">
                <input
                  type="checkbox"
                  checked={productDelivered}
                  disabled={loading}
                  onChange={(event) =>
                    setProductDelivered(event.target.checked)
                  }
                  className="h-5 w-5"
                />

                <div>
                  <p className="font-medium text-white">Producto entregado</p>

                  <p className="text-xs text-white/40">
                    Confirmo que el cliente recibió el producto.
                  </p>
                </div>
              </label>

              {hasInstallment && (
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-black/10 p-4">
                  <input
                    type="checkbox"
                    checked={paymentReceived}
                    disabled={loading}
                    onChange={(event) =>
                      setPaymentReceived(event.target.checked)
                    }
                    className="h-5 w-5"
                  />

                  <div>
                    <p className="font-medium text-white">Dinero recibido</p>

                    <p className="text-xs text-white/40">
                      Confirmo que se recibió el pago de la cuota 1.
                    </p>
                  </div>
                </label>
              )}
            </section>
          )}

          {/* MONTO */}

          {requiresPayment && (
            <div>
              <label className="mb-2 block text-sm font-medium text-white/70">
                Monto recibido
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                max={totalToCollect}
                value={collectedAmount}
                disabled={loading}
                onChange={(event) => setCollectedAmount(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-[#0B1220] px-4 py-3 text-white outline-none focus:border-cyan-500/50"
              />

              <div className="mt-2 flex justify-between gap-4 text-xs">
                <span className="text-white/40">
                  Máximo: {formatCurrency(totalToCollect)}
                </span>

                {numericCollectedAmount > totalToCollect && (
                  <span className="text-red-300">
                    El monto supera el total pendiente.
                  </span>
                )}
              </div>
            </div>
          )}

          {/* OBSERVACIÓN */}

          <div>
            <label className="mb-2 block text-sm font-medium text-white/70">
              Observación
            </label>

            <textarea
              value={notes}
              disabled={loading}
              onChange={(event) => setNotes(event.target.value)}
              rows={3}
              placeholder="Observación opcional..."
              className="w-full rounded-2xl border border-white/10 bg-[#0B1220] p-4 text-white outline-none focus:border-cyan-500/50"
            />
          </div>

          {/* COMPLETAR */}

          <SaveButton
            disabled={loading || !canComplete}
            onClick={handleComplete}
            className="w-full"
          >
            {loading
              ? "Guardando..."
              : isDelivery
                ? hasInstallment
                  ? "Confirmar entrega y cobro"
                  : "Confirmar entrega"
                : "Registrar cobro"}
          </SaveButton>

          {/* VISITA FALLIDA */}

          <section className="border-t border-white/10 pt-6">
            <h3 className="font-semibold text-white">
              ¿No se pudo completar la visita?
            </h3>

            <p className="mt-1 text-sm text-white/50">
              Seleccioná el motivo para dejar registrada la visita.
            </p>

            <div className="mt-4">
              <label className="mb-2 block text-sm text-white/70">Motivo</label>

              <select
                value={failedVisitReason}
                disabled={loading}
                onChange={(event) =>
                  setFailedVisitReason(
                    event.target.value as FailedVisitReason | "",
                  )
                }
                className="w-full rounded-2xl border border-white/10 bg-[#0B1220] px-4 py-3 text-white outline-none focus:border-red-500/50"
              >
                <option value="">Seleccionar motivo</option>

                <option value="client_absent">Cliente ausente</option>

                <option value="refused_payment">Rechazó el pago</option>

                <option value="wrong_address">Domicilio incorrecto</option>

                <option value="other">Otro</option>
              </select>
            </div>

            <DangerButton
              disabled={loading || !failedVisitReason}
              onClick={handleFailed}
              className="mt-4 w-full"
            >
              Registrar visita fallida
            </DangerButton>
          </section>

          <button
            type="button"
            disabled={loading}
            onClick={() => onOpenChange(false)}
            className="w-full rounded-xl border border-white/10 px-4 py-3 text-sm text-white/70 hover:bg-white/5"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
