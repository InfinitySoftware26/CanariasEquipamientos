"use client";

import { useState } from "react";

import { useAuthStore } from "@/store/auth.store";
import { StaffRole } from "@/types/auth.types";

import { useFailedVisits } from "@/hooks/failed-visits/useFailedVisits";
import { useRescheduleFailedVisit } from "@/hooks/failed-visits/useRescheduleFailedVisits";

import { FailedVisitsTable } from "@/components/payments/FailedVisitsTable";
import { RescheduleFailedVisitModal } from "@/components/payments/ReScheduleFailedVisitModal";
import { FailedVisit } from "@/types/failed-visits/failed-visitis.type";

const ALLOWED_ROLES = [
  StaffRole.ADMIN,
  StaffRole.MANAGER,
  StaffRole.SUPER_ADMIN,
];

export default function FailedVisitsPage() {
  const activeRole = useAuthStore((state) => state.activeRole);

  const allowed = !!activeRole && ALLOWED_ROLES.includes(activeRole);

  const {
    failedVisits,
    loading,
    error,
    refresh,
    status,
    setStatus,
    search,
    setSearch,
    filters,
    stats,
  } = useFailedVisits();

  const { reschedule, loading: rescheduling } = useRescheduleFailedVisit();

  const [selected, setSelected] = useState<FailedVisit | null>(null);

  if (!allowed) {
    return (
      <div className="rounded-2xl border border-white/10 bg-[#0E1726] p-8 text-center">
        <p className="text-white/60">
          No tenés permisos para acceder a esta sección.
        </p>
      </div>
    );
  }

  async function handleReschedule(failedVisitId: string, date: string) {
    if (!failedVisitId) {
      throw new Error("No se encontró el identificador de la visita fallida.");
    }

    await reschedule(failedVisitId, date);

    setSelected(null);

    await refresh();
  }

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <section>
        <h1 className="text-3xl font-bold text-white">Visitas fallidas</h1>

        <p className="mt-2 text-white/60">
          Control e historial de visitas de cobranza sin resultado exitoso.
        </p>
      </section>

      {/* STATS */}
      <section className="grid gap-4 sm:grid-cols-3">
        {[
          {
            title: "Total",
            value: stats.total,
          },
          {
            title: "Pendientes de reprogramar",
            value: stats.pending,
          },
          {
            title: "Reprogramadas",
            value: stats.rescheduled,
          },
        ].map((card) => (
          <div
            key={card.title}
            className="rounded-3xl border border-white/10 bg-[#0E1726] p-6"
          >
            <p className="text-sm text-white/50">{card.title}</p>

            <h3 className="mt-3 text-3xl font-bold text-white">{card.value}</h3>
          </div>
        ))}
      </section>

      {/* FILTERS */}
      <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar por cliente o venta..."
          className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-[#F5A300] sm:max-w-xs"
        />

        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => setStatus(filter.value)}
              className={`rounded-xl px-4 py-2 transition ${
                status === filter.value
                  ? "bg-[#F5A300] text-black"
                  : "bg-slate-900 text-white hover:bg-slate-800"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </section>

      {/* TABLE */}
      <section>
        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 5 }, (_, index) => (
              <div
                key={`failed-visit-skeleton-${index}`}
                className="h-14 animate-pulse rounded-2xl border border-white/10 bg-white/5"
              />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center">
            <p className="text-red-300">{error}</p>

            <button
              type="button"
              onClick={refresh}
              className="mt-4 inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 font-medium text-white transition hover:bg-white/5"
            >
              Reintentar
            </button>
          </div>
        )}

        {!loading && !error && failedVisits.length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-[#0E1726] p-8 text-center">
            <p className="text-white/60">
              No hay visitas fallidas registradas.
            </p>
          </div>
        )}

        {!loading && !error && failedVisits.length > 0 && (
          <FailedVisitsTable
            failedVisits={failedVisits}
            onReschedule={setSelected}
          />
        )}
      </section>

      {/* RESCHEDULE MODAL */}
      <RescheduleFailedVisitModal
        failedVisit={selected}
        loading={rescheduling}
        onClose={() => setSelected(null)}
        onSubmit={handleReschedule}
      />
    </div>
  );
}
