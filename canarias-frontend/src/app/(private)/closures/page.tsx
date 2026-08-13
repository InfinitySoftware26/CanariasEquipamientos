"use client";

import { useAuthStore } from "@/store/auth.store";
import { StaffRole } from "@/types/auth.types";
import { useClosures } from "@/hooks/closures/useClosures";

import { ClosureStats } from "@/components/closures/ClosureStats";
import { ClosureFilters } from "@/components/closures/ClosureFilters";
import { ClosureList } from "@/components/closures/ClosureList";

const ALLOWED_ROLES = [StaffRole.ADMIN, StaffRole.MANAGER, StaffRole.SUPER_ADMIN];

export default function ClosuresPage() {
  const activeRole = useAuthStore((state) => state.activeRole);
  const allowed = !!activeRole && ALLOWED_ROLES.includes(activeRole);

  const {
    closures,
    loading,
    error,
    refresh,
    status,
    setStatus,
    closingDate,
    setClosingDate,
    filters,
    stats,
  } = useClosures();

  if (!allowed) {
    return (
      <div className="rounded-2xl border border-white/10 bg-[#0E1726] p-8 text-center">
        <p className="text-white/60">
          No tenés permisos para acceder a esta sección.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <section>
        <h1 className="text-3xl font-bold text-white">Cierres diarios</h1>

        <p className="mt-2 text-white/60">
          Validación de cierres de cobranza declarados por los cobradores.
        </p>
      </section>

      {/* STATS */}
      <ClosureStats stats={stats} />

      {/* FILTERS */}
      <ClosureFilters
        filters={filters}
        status={status}
        onStatusChange={setStatus}
        closingDate={closingDate}
        onClosingDateChange={setClosingDate}
      />

      {/* TABLE */}
      <section>
        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 5 }, (_, i) => (
              <div
                key={i}
                className="h-14 animate-pulse rounded-2xl border border-white/10 bg-white/5"
              />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center">
            <p className="text-red-300">{error}</p>

            <button
              onClick={refresh}
              className="mt-4 inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 font-medium text-white transition hover:bg-white/5"
            >
              Reintentar
            </button>
          </div>
        )}

        {!loading && !error && closures.length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-[#0E1726] p-8 text-center">
            <p className="text-white/60">No hay cierres diarios registrados.</p>
          </div>
        )}

        {!loading && !error && closures.length > 0 && (
          <ClosureList closures={closures} />
        )}
      </section>
    </div>
  );
}
