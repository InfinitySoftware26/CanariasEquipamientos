"use client";

import { useState } from "react";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  ClosureReconciliation,
  DailyClosure,
} from "@/types/closures/closure.types";

interface Props {
  closure: DailyClosure;
  reconciliation: ClosureReconciliation | null;
  canValidate: boolean;
  acting: boolean;
  onApprove: () => Promise<void>;
  onReject: () => Promise<void>;
}

const STATUS_LABELS: Record<DailyClosure["status"], string> = {
  pending: "Pendiente",
  validated: "Aprobado",
  rejected: "Rechazado",
};

const STATUS_STYLES: Record<DailyClosure["status"], string> = {
  pending: "bg-[#F5A300]/15 text-[#F5A300]",
  validated: "bg-green-500/15 text-green-400",
  rejected: "bg-red-500/15 text-red-400",
};

function differenceColor(difference: number) {
  if (difference > 0) return "text-red-400";
  if (difference < 0) return "text-green-400";
  return "text-white/70";
}

export function ClosureDetail({
  closure,
  reconciliation,
  canValidate,
  acting,
  onApprove,
  onReject,
}: Props) {
  const [pendingAction, setPendingAction] = useState<
    "validated" | "rejected" | null
  >(null);
  const [error, setError] = useState<string | null>(null);

  const showActions = canValidate && closure.status === "pending";

  async function handleConfirm() {
    try {
      setError(null);

      if (pendingAction === "validated") {
        await onApprove();
      } else if (pendingAction === "rejected") {
        await onReject();
      }

      setPendingAction(null);
    } catch (err) {
      console.error("Error validando cierre diario:", err);

      setPendingAction(null);

      setError(
        err instanceof Error ? err.message : "No se pudo actualizar el cierre.",
      );
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      <section className="rounded-3xl border border-white/10 bg-[#0E1726] p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white">
              Cierre del {new Date(closure.closingDate).toLocaleDateString()}
            </h2>

            <p className="mt-1 text-sm text-white/50">
              Cobrador:{" "}
              {closure.staff
                ? `${closure.staff.name}`
                : "Cobrador no disponible"}
            </p>
          </div>

          <span
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${STATUS_STYLES[closure.status]}`}
          >
            {STATUS_LABELS[closure.status]}
          </span>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-white/50">Total declarado</p>

            <p className="mt-2 text-2xl font-bold text-white">
              $ {Number(closure.totalCollected).toLocaleString()}
            </p>
          </div>

          {closure.notes && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm text-white/50">Observaciones</p>

              <p className="mt-2 text-white/80">{closure.notes}</p>
            </div>
          )}
        </div>
      </section>

      {reconciliation && (
        <section className="rounded-3xl border border-white/10 bg-[#0E1726] p-6 sm:p-8">
          <h3 className="text-lg font-bold text-white">Conciliación</h3>

          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm text-white/50">Declarado</p>

              <p className="mt-2 text-xl font-bold text-white">
                $ {reconciliation.declared.toLocaleString()}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm text-white/50">Esperado por el sistema</p>

              <p className="mt-2 text-xl font-bold text-white">
                $ {reconciliation.systemCalculated.toLocaleString()}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm text-white/50">Diferencia</p>

              <p
                className={`mt-2 text-xl font-bold ${differenceColor(reconciliation.difference)}`}
              >
                $ {reconciliation.difference.toLocaleString()}
              </p>
            </div>
          </div>
        </section>
      )}

      {showActions && (
        <section className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            onClick={() => setPendingAction("rejected")}
            disabled={acting}
            className="rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-3 font-medium text-red-300 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Rechazar
          </button>

          <button
            onClick={() => setPendingAction("validated")}
            disabled={acting}
            className="rounded-xl bg-[#F5A300] px-5 py-3 font-semibold text-black transition hover:bg-[#ffb21c] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Aprobar
          </button>
        </section>
      )}

      <ConfirmDialog
        open={pendingAction !== null}
        onOpenChange={(open) => {
          if (!open) setPendingAction(null);
        }}
        title={
          pendingAction === "rejected"
            ? "¿Rechazar cierre?"
            : "¿Aprobar cierre?"
        }
        description={
          pendingAction === "rejected"
            ? "El cierre quedará marcado como rechazado. Esta acción no se puede deshacer."
            : "El cierre quedará marcado como aprobado. Esta acción no se puede deshacer."
        }
        confirmText={pendingAction === "rejected" ? "Rechazar" : "Aprobar"}
        destructive={pendingAction === "rejected"}
        loading={acting}
        onConfirm={handleConfirm}
      />
    </div>
  );
}
