"use client";

import { useEffect, useState } from "react";

import { FailedVisit } from "@/types/payments/failed_visits.types";

interface Props {
  failedVisit: FailedVisit | null;
  loading: boolean;
  onClose: () => void;
  onSubmit: (failedVisitId: string, rescheduledDate: string) => Promise<void>;
}

function getTomorrow() {
  const date = new Date();
  date.setDate(date.getDate() + 1);

  return date.toISOString().split("T")[0];
}

function getToday() {
  return new Date().toISOString().split("T")[0];
}

export function RescheduleFailedVisitModal({
  failedVisit,
  loading,
  onClose,
  onSubmit,
}: Props) {
  const [date, setDate] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!failedVisit) {
      return;
    }

    setDate(
      failedVisit.rescheduledDate
        ? failedVisit.rescheduledDate.split("T")[0]
        : getTomorrow(),
    );

    setError(null);
  }, [failedVisit]);

  if (!failedVisit) {
    return null;
  }

  const visit = failedVisit;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!date) {
      setError("Seleccioná una fecha para reprogramar la visita.");
      return;
    }

    try {
      setError(null);

      await onSubmit(visit.id, date);
    } catch (err) {
      console.error("Error reprogramando visita:", err);

      setError(
        err instanceof Error
          ? err.message
          : "No se pudo reprogramar la visita.",
      );
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0E1726] p-6 shadow-2xl">
        <div>
          <h2 className="text-xl font-bold text-white">Reprogramar visita</h2>

          <p className="mt-2 text-sm text-white/50">
            Cliente: {visit.clientId}
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
              htmlFor="rescheduledDate"
              className="mb-2 block text-sm font-medium text-white"
            >
              Nueva fecha
            </label>

            <input
              id="rescheduledDate"
              type="date"
              required
              min={getToday()}
              value={date}
              onChange={(event) => setDate(event.target.value)}
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
              {loading ? "Guardando..." : "Reprogramar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
