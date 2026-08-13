"use client";

import { useState } from "react";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Settlement } from "@/types/settlements/settlement.types";

interface Props {
  settlement: Settlement;
  canValidate: boolean;
  acting: boolean;
  onApprove: () => Promise<void>;
  onReject: () => Promise<void>;
}

const STATUS_LABELS: Record<Settlement["status"], string> = {
  pending: "Pendiente",
  validated: "Aprobada",
  rejected: "Rechazada",
};

const STATUS_STYLES: Record<Settlement["status"], string> = {
  pending: "bg-[#F5A300]/15 text-[#F5A300]",
  validated: "bg-green-500/15 text-green-400",
  rejected: "bg-red-500/15 text-red-400",
};

function truncateId(id: string) {
  return `${id.slice(0, 8)}...`;
}

function outstandingBadge(outstandingDebt: number) {
  if (outstandingDebt > 0) {
    return { label: "Deuda pendiente", style: "bg-red-500/15 text-red-400" };
  }

  if (outstandingDebt < 0) {
    return { label: "Excedente", style: "bg-[#F5A300]/15 text-[#F5A300]" };
  }

  return { label: "Saldado", style: "bg-green-500/15 text-green-400" };
}

export function SettlementDetail({
  settlement,
  canValidate,
  acting,
  onApprove,
  onReject,
}: Props) {
  const [pendingAction, setPendingAction] = useState<
    "validated" | "rejected" | null
  >(null);
  const [error, setError] = useState<string | null>(null);

  const showActions = canValidate && settlement.status === "pending";
  const debtBadge = outstandingBadge(settlement.outstandingDebt);

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
      console.error("Error validando liquidación:", err);

      setPendingAction(null);

      setError(
        err instanceof Error
          ? err.message
          : "No se pudo actualizar la liquidación.",
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
              Liquidación del{" "}
              {new Date(settlement.settlementDate).toLocaleDateString()}
            </h2>

            <p className="mt-1 text-sm text-white/50">
              Cobrador: {truncateId(settlement.staffId)}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <span
              className={`rounded-full px-4 py-1.5 text-sm font-medium ${STATUS_STYLES[settlement.status]}`}
            >
              {STATUS_LABELS[settlement.status]}
            </span>

            <span
              className={`rounded-full px-4 py-1.5 text-sm font-medium ${debtBadge.style}`}
            >
              {debtBadge.label}
            </span>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-white/50">A cobrar</p>

            <p className="mt-2 text-xl font-bold text-white">
              $ {Number(settlement.amountDue).toLocaleString()}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-white/50">Cobrado</p>

            <p className="mt-2 text-xl font-bold text-white">
              $ {Number(settlement.amountCollected).toLocaleString()}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-white/50">Deuda pendiente</p>

            <p className="mt-2 text-xl font-bold text-white">
              $ {Number(settlement.outstandingDebt).toLocaleString()}
            </p>
          </div>

          {settlement.notes && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 sm:col-span-3">
              <p className="text-sm text-white/50">Observaciones</p>

              <p className="mt-2 text-white/80">{settlement.notes}</p>
            </div>
          )}
        </div>
      </section>

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
            ? "¿Rechazar liquidación?"
            : "¿Aprobar liquidación?"
        }
        description={
          pendingAction === "rejected"
            ? "La liquidación quedará marcada como rechazada. Esta acción no se puede deshacer."
            : "La liquidación quedará marcada como aprobada. Esta acción no se puede deshacer."
        }
        confirmText={pendingAction === "rejected" ? "Rechazar" : "Aprobar"}
        destructive={pendingAction === "rejected"}
        loading={acting}
        onConfirm={handleConfirm}
      />
    </div>
  );
}
