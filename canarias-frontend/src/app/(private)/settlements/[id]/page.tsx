"use client";

import { useParams } from "next/navigation";

import { useAuthStore } from "@/store/auth.store";
import { StaffRole } from "@/types/auth.types";
import { useSettlementDetail } from "@/hooks/settlements/useSettlementDetail";
import { useSettlementActions } from "@/hooks/settlements/useSettlementActions";

import { SettlementDetail } from "@/components/settlements/SettlementDetail";

const ALLOWED_ROLES = [StaffRole.ADMIN, StaffRole.MANAGER, StaffRole.SUPER_ADMIN];

export default function SettlementDetailPage() {
  const { id } = useParams<{ id: string }>();

  const activeRole = useAuthStore((state) => state.activeRole);
  const allowed = !!activeRole && ALLOWED_ROLES.includes(activeRole);

  const { settlement, loading, error, refresh } = useSettlementDetail(id);

  const { approve, reject, loading: acting } = useSettlementActions();

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
        <h1 className="text-3xl font-bold text-white">
          Detalle de liquidación
        </h1>

        <p className="mt-2 text-white/60">
          Revisá los montos antes de aprobar o rechazar la liquidación.
        </p>
      </section>

      {loading && (
        <div className="h-48 animate-pulse rounded-3xl border border-white/10 bg-white/5" />
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

      {!loading && !error && settlement && (
        <SettlementDetail
          settlement={settlement}
          canValidate={allowed}
          acting={acting}
          onApprove={async () => {
            await approve(settlement.settlementId);
            await refresh();
          }}
          onReject={async () => {
            await reject(settlement.settlementId);
            await refresh();
          }}
        />
      )}
    </div>
  );
}
