"use client";

import { useEffect, useMemo, useState } from "react";

import {
  RouteSheetItem,
  RouteSheetItemResult,
} from "@/types/rotue-sheets/routeSheets.types";

import { CancelButton } from "@/components/button/CancelButton";
import { SaveButton } from "@/components/button/SaveButton";

export type FailedVisitReason =
  | "client_absent"
  | "refused_payment"
  | "wrong_address"
  | "other";

export interface RouteSheetItemResultData {
  result: RouteSheetItemResult;
  collectedAmount?: number;
  notes?: string;
  failedVisitReason?: FailedVisitReason;
}

interface Props {
  item: RouteSheetItem | null;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (data: RouteSheetItemResultData) => void | Promise<void>;
}

function parseMoney(value: string): number | undefined {
  if (!value.trim()) {
    return undefined;
  }

  // El input usa punto decimal.
  const normalized = value.replace(",", ".").trim();
  const parsed = Number(normalized);

  if (!Number.isFinite(parsed)) {
    return undefined;
  }

  return parsed;
}

function formatMoney(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(Number(value))) {
    return "$0,00";
  }

  return Number(value).toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function RouteSheetItemResultModal({
  item,
  loading = false,
  onClose,
  onSubmit,
}: Props) {
  const [result, setResult] = useState<RouteSheetItemResult>("completed");

  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");

  const [reason, setReason] = useState<FailedVisitReason>("client_absent");

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!item) {
      return;
    }

    setResult("completed");

    // Si tenemos el importe de la cuota, lo mostramos como sugerencia.
    if (item.itemType === "installment" && item.installmentAmount != null) {
      setAmount(String(Number(item.installmentAmount)));
    } else {
      setAmount("");
    }

    setNotes("");
    setReason("client_absent");
    setError(null);
  }, [item]);

  const isInstallment = item?.itemType === "installment";
  const isFailed = result === "failed";

  const installmentAmount = useMemo(() => {
    if (!item || item.installmentAmount == null) {
      return null;
    }

    const value = Number(item.installmentAmount);

    return Number.isFinite(value) ? value : null;
  }, [item]);

  if (!item) {
    return null;
  }

  async function handleSubmit() {
    setError(null);

    const numericAmount = parseMoney(amount);

    if (
      isInstallment &&
      result === "completed" &&
      (!numericAmount || numericAmount <= 0)
    ) {
      setError("Ingresá un monto cobrado mayor a cero.");
      return;
    }

    if (
      isInstallment &&
      result === "completed" &&
      installmentAmount != null &&
      numericAmount != null &&
      numericAmount > installmentAmount
    ) {
      setError(
        `El monto cobrado no puede superar el saldo de la cuota ($${formatMoney(
          installmentAmount,
        )}).`,
      );
      return;
    }

    if (isFailed && !notes.trim()) {
      setError("Ingresá una observación para la visita fallida.");
      return;
    }

    try {
      await onSubmit({
        result,
        collectedAmount: result === "completed" ? numericAmount : undefined,
        notes: notes.trim() || undefined,
        failedVisitReason: isFailed ? reason : undefined,
      });
    } catch (err) {
      console.error("Error registrando resultado:", err);

      setError(
        err instanceof Error
          ? err.message
          : "No se pudo registrar el resultado.",
      );
    }
  }

  const clientName = item.clientName || "Cliente no disponible";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/10 bg-[#101b2d] p-6 shadow-2xl">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-white">Registrar visita</h2>

          <div className="mt-3 space-y-1 text-sm text-white/60">
            <p>
              Cliente: <span className="text-white">{clientName}</span>
            </p>

            {item.clientDocumentNumber && (
              <p>
                DNI:{" "}
                <span className="text-white">{item.clientDocumentNumber}</span>
              </p>
            )}

            {item.clientAddress && (
              <p>
                Dirección:{" "}
                <span className="text-white">{item.clientAddress}</span>
              </p>
            )}

            {item.clientPhone && (
              <p>
                Teléfono: <span className="text-white">{item.clientPhone}</span>
              </p>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="space-y-5">
          <div>
            <label className="mb-2 block text-sm text-white/70">
              Resultado
            </label>

            <select
              value={result}
              disabled={loading}
              onChange={(event) =>
                setResult(event.target.value as RouteSheetItemResult)
              }
              className="w-full rounded-xl bg-black/20 p-3 text-white outline-none ring-1 ring-white/10 focus:ring-[#F5A300]"
            >
              <option value="completed">
                {isInstallment ? "Cobro completado" : "Entrega completada"}
              </option>

              <option value="failed">Visita fallida</option>
            </select>
          </div>

          {isInstallment && result === "completed" && (
            <div>
              <label className="mb-2 block text-sm text-white/70">
                Monto cobrado
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                max={installmentAmount != null ? installmentAmount : undefined}
                disabled={loading}
                placeholder="Monto cobrado"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                className="w-full rounded-xl bg-black/20 p-3 text-white outline-none ring-1 ring-white/10 placeholder:text-white/30 focus:ring-[#F5A300]"
              />

              {installmentAmount != null && (
                <div className="mt-2 rounded-xl bg-cyan-500/5 p-3">
                  <p className="text-xs text-white/40">
                    Saldo pendiente de esta cuota
                  </p>

                  <p className="mt-1 text-lg font-semibold text-cyan-300">
                    ${formatMoney(installmentAmount)}
                  </p>
                </div>
              )}
            </div>
          )}

          {isFailed && (
            <div>
              <label className="mb-2 block text-sm text-white/70">
                Motivo de la visita fallida
              </label>

              <select
                value={reason}
                disabled={loading}
                onChange={(event) =>
                  setReason(event.target.value as FailedVisitReason)
                }
                className="w-full rounded-xl bg-black/20 p-3 text-white outline-none ring-1 ring-white/10 focus:ring-[#F5A300]"
              >
                <option value="client_absent">Cliente ausente</option>

                <option value="refused_payment">Pago rechazado</option>

                <option value="wrong_address">Dirección incorrecta</option>

                <option value="other">Otro motivo</option>
              </select>
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm text-white/70">
              Observaciones
              {isFailed && <span className="ml-1 text-red-300">*</span>}
            </label>

            <textarea
              placeholder="Observaciones de la visita"
              value={notes}
              disabled={loading}
              onChange={(event) => setNotes(event.target.value)}
              className="min-h-[100px] w-full rounded-xl bg-black/20 p-3 text-white outline-none ring-1 ring-white/10 placeholder:text-white/30 focus:ring-[#F5A300]"
            />
          </div>

          <div className="flex gap-3">
            <CancelButton
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-3"
            />

            <SaveButton
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 bg-green-600 py-3 hover:bg-emerald-500"
            >
              {loading ? "Guardando..." : "Guardar"}
            </SaveButton>
          </div>
        </div>
      </div>
    </div>
  );
}
