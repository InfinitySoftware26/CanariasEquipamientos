"use client";

import { CalendarClock } from "lucide-react";

import { FailedVisit } from "@/types/failed-visits/failed-visitis.type";

interface Props {
  failedVisits: FailedVisit[];
  onReschedule: (failedVisit: FailedVisit) => void;
}

const reasonLabels: Record<string, string> = {
  client_absent: "Cliente ausente",
  refused_payment: "Pago rechazado",
  wrong_address: "Dirección incorrecta",
  other: "Otro",
};

function formatDate(value?: string | null) {
  if (!value) {
    return "-";
  }

  const date = value.includes("T")
    ? new Date(value)
    : new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "medium",
  }).format(date);
}

export function FailedVisitsTable({
  failedVisits,
  onReschedule,
}: Props) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#0E1726]">
      <table className="w-full min-w-[900px]">
        <thead className="border-b border-white/10">
          <tr className="text-left text-sm text-white/50">
            <th className="px-5 py-4">Cliente</th>
            <th className="px-5 py-4">Motivo</th>
            <th className="px-5 py-4">Observaciones</th>
            <th className="px-5 py-4">Reprogramada</th>
            <th className="px-5 py-4">Registrada</th>
            <th className="px-5 py-4">Acción</th>
          </tr>
        </thead>

        <tbody>
          {failedVisits.length === 0 ? (
            <tr>
              <td
                colSpan={6}
                className="px-5 py-10 text-center text-sm text-white/50"
              >
                No hay visitas fallidas para mostrar.
              </td>
            </tr>
          ) : (
            failedVisits.map((visit) => (
              <tr
                key={visit.failedVisitId}
                className="border-b border-white/5 transition hover:bg-white/[0.02]"
              >
                <td className="px-5 py-4">
                  <p className="font-medium text-white">
                    {visit.clientId}
                  </p>

                  <p className="mt-1 max-w-[220px] truncate text-xs text-white/40">
                    Ítem: {visit.routeSheetItemId}
                  </p>
                </td>

                <td className="px-5 py-4">
                  <span className="rounded-lg bg-red-500/10 px-3 py-1.5 text-sm text-red-300">
                    {reasonLabels[visit.reason] ?? visit.reason}
                  </span>
                </td>

                <td className="max-w-[240px] px-5 py-4">
                  <p
                    className="truncate text-sm text-white/70"
                    title={visit.notes ?? undefined}
                  >
                    {visit.notes || "-"}
                  </p>
                </td>

                <td className="px-5 py-4 text-sm text-white/70">
                  {formatDate(visit.rescheduledDate)}
                </td>

                <td className="px-5 py-4 text-sm text-white/70">
                  {formatDate(visit.registeredAt)}
                </td>

                <td className="px-5 py-4">
                  <button
                    type="button"
                    onClick={() => onReschedule(visit)}
                    className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm font-medium text-white transition hover:bg-white/5"
                  >
                    <CalendarClock size={16} />
                    Reprogramar
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
