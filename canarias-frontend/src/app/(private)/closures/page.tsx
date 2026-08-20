"use client";

import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

import { useAuthStore } from "@/store/auth.store";
import { StaffRole } from "@/types/auth.types";
import { useClosures } from "@/hooks/closures/useClosures";

import { ClosureStats } from "@/components/closures/ClosureStats";
import { ClosureFilters } from "@/components/closures/ClosureFilters";
import { ClosureList } from "@/components/closures/ClosureList";

const VALIDATOR_ROLES = [
  StaffRole.ADMIN,
  StaffRole.MANAGER,
  StaffRole.SUPER_ADMIN,
];

const ALLOWED_ROLES = [...VALIDATOR_ROLES, StaffRole.COLLECTOR];

export default function ClosuresPage() {
  const router = useRouter();

  const activeRole = useAuthStore((state) => state.activeRole);
  const user = useAuthStore((state) => state.user);

  const allowed = !!activeRole && ALLOWED_ROLES.includes(activeRole);
  const isCollector = activeRole === StaffRole.COLLECTOR;

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
  } = useClosures(isCollector ? user?.staffId : undefined);

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
      <section className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">
            {isCollector ? "Mis cierres diarios" : "Cierres diarios"}
          </h1>

          <p className="mt-2 text-white/60">
            {isCollector
              ? "Declará el cierre de tu jornada y seguí el estado de validación."
              : "Validación de cierres de cobranza declarados por los cobradores."}
          </p>
        </div>

        {isCollector && (
          <button
            onClick={() => router.push("/closures/new")}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#F5A300] px-5 py-3 font-semibold text-black transition hover:bg-[#ffb21c] active:scale-[0.98]"
          >
            <Plus size={20} />
            Declarar cierre
          </button>
        )}
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
            <p className="text-white/60">
              {isCollector
                ? "Todavía no declaraste ningún cierre diario."
                : "No hay cierres diarios registrados."}
            </p>

            {isCollector && (
              <button
                onClick={() => router.push("/closures/new")}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#F5A300] px-4 py-2 font-medium text-black transition hover:bg-[#ffb21c]"
              >
                <Plus size={18} />
                Declarar el primer cierre
              </button>
            )}
          </div>
        )}

        {!loading && !error && closures.length > 0 && (
          <ClosureList closures={closures} />
        )}
      </section>
    </div>
  );
}