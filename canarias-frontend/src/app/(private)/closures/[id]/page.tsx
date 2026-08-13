"use client";

import { useParams } from "next/navigation";

import { useAuthStore } from "@/store/auth.store";
import { StaffRole } from "@/types/auth.types";
import { useClosureDetail } from "@/hooks/closures/useClosureDetail";
import { useClosureActions } from "@/hooks/closures/useClosureActions";

import { ClosureDetail } from "@/components/closures/ClosureDetail";

const ALLOWED_ROLES = [StaffRole.ADMIN, StaffRole.MANAGER, StaffRole.SUPER_ADMIN];

export default function ClosureDetailPage() {
  const { id } = useParams<{ id: string }>();

  const activeRole = useAuthStore((state) => state.activeRole);
  const allowed = !!activeRole && ALLOWED_ROLES.includes(activeRole);

  const { closure, reconciliation, loading, error, refresh } =
    useClosureDetail(id, allowed);

  const { approve, reject, loading: acting } = useClosureActions();

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
      <section>
        <h1 className="text-3xl font-bold text-white">Detalle de cierre</h1>

        <p className="mt-2 text-white/60">
          Revisá la conciliación antes de aprobar o rechazar el cierre.
        </p>
      </section>

      {loading && (
        <div className="space-y-4">
          <div className="h-40 animate-pulse rounded-3xl border border-white/10 bg-white/5" />

          <div className="h-32 animate-pulse rounded-3xl border border-white/10 bg-white/5" />
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

      {!loading && !error && closure && (
        <ClosureDetail
          closure={closure}
          reconciliation={reconciliation}
          canValidate={allowed}
          acting={acting}
          onApprove={async () => {
            await approve(closure.closureId);
            await refresh();
          }}
          onReject={async () => {
            await reject(closure.closureId);
            await refresh();
          }}
        />
      )}
    </div>
  );
}
