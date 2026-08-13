"use client";

import { useState } from "react";

import { useAuthStore } from "@/store/auth.store";
import { StaffRole } from "@/types/auth.types";
import { useReportDownload } from "@/hooks/reports/useReportDownload";
import {
  downloadCashMovementsExcel,
  downloadCollectionsExcel,
  downloadFailedVisitsPdf,
  downloadPendingInstallmentsExcel,
} from "@/services/reports/reports.service";

import { ReportCard } from "@/components/reports/ReportCard";

const ALLOWED_ROLES = [StaffRole.ADMIN, StaffRole.MANAGER, StaffRole.SUPER_ADMIN];

const dateInputClass =
  "w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-[#F5A300]";

export default function ReportsPage() {
  const activeRole = useAuthStore((state) => state.activeRole);
  const allowed = !!activeRole && ALLOWED_ROLES.includes(activeRole);

  const [collectionsFrom, setCollectionsFrom] = useState("");
  const [collectionsTo, setCollectionsTo] = useState("");
  const collectionsDownload = useReportDownload();

  const [cashMovementsFrom, setCashMovementsFrom] = useState("");
  const [cashMovementsTo, setCashMovementsTo] = useState("");
  const cashMovementsDownload = useReportDownload();

  const pendingInstallmentsDownload = useReportDownload();
  const failedVisitsDownload = useReportDownload();

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
        <h1 className="text-3xl font-bold text-white">Reportes</h1>

        <p className="mt-2 text-white/60">
          Centro de descarga de reportes de la sociedad.
        </p>
      </section>

      {/* BANNER */}
      <div className="rounded-2xl border border-[#F5A300]/20 bg-[#F5A300]/5 p-4 text-sm text-white/70">
        Algunos reportes todavía no tienen un endpoint general en el backend
        (hoja de ruta y recibos se descargan desde el detalle de cada
        registro; el cierre diario en PDF está pendiente de desarrollo) y
        aparecen marcados como &quot;Próximamente&quot;.
      </div>

      {/* CARDS */}
      <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <ReportCard
          title="Cobranza"
          description="Detalle de pagos registrados en el rango seleccionado."
          format="excel"
          loading={collectionsDownload.loading}
          onDownload={() =>
            collectionsDownload.download(() =>
              downloadCollectionsExcel({
                from: collectionsFrom || undefined,
                to: collectionsTo || undefined,
              }),
            )
          }
        >
          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              value={collectionsFrom}
              onChange={(e) => setCollectionsFrom(e.target.value)}
              className={dateInputClass}
            />

            <input
              type="date"
              value={collectionsTo}
              onChange={(e) => setCollectionsTo(e.target.value)}
              className={dateInputClass}
            />
          </div>

          {collectionsDownload.error && (
            <p className="text-xs text-red-400">{collectionsDownload.error}</p>
          )}
        </ReportCard>

        <ReportCard
          title="Cuotas pendientes"
          description="Listado completo de cuotas pendientes de la sociedad."
          format="excel"
          loading={pendingInstallmentsDownload.loading}
          onDownload={() =>
            pendingInstallmentsDownload.download(downloadPendingInstallmentsExcel)
          }
        >
          {pendingInstallmentsDownload.error && (
            <p className="text-xs text-red-400">
              {pendingInstallmentsDownload.error}
            </p>
          )}
        </ReportCard>

        <ReportCard
          title="Visitas fallidas"
          description="Visitas de cobranza sin resultado exitoso."
          format="pdf"
          loading={failedVisitsDownload.loading}
          onDownload={() => failedVisitsDownload.download(downloadFailedVisitsPdf)}
        >
          {failedVisitsDownload.error && (
            <p className="text-xs text-red-400">{failedVisitsDownload.error}</p>
          )}
        </ReportCard>

        <ReportCard
          title="Movimientos de caja"
          description="Ingresos y egresos de caja en el rango seleccionado."
          format="excel"
          loading={cashMovementsDownload.loading}
          onDownload={() =>
            cashMovementsDownload.download(() =>
              downloadCashMovementsExcel({
                from: cashMovementsFrom || undefined,
                to: cashMovementsTo || undefined,
              }),
            )
          }
        >
          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              value={cashMovementsFrom}
              onChange={(e) => setCashMovementsFrom(e.target.value)}
              className={dateInputClass}
            />

            <input
              type="date"
              value={cashMovementsTo}
              onChange={(e) => setCashMovementsTo(e.target.value)}
              className={dateInputClass}
            />
          </div>

          {cashMovementsDownload.error && (
            <p className="text-xs text-red-400">{cashMovementsDownload.error}</p>
          )}
        </ReportCard>

        <ReportCard
          title="Hoja de ruta"
          description="PDF de la hoja de ruta de un cobrador."
          format="pdf"
          comingSoon
          tooltip="Disponible desde el detalle de la hoja de ruta"
        />

        <ReportCard
          title="Cierre diario"
          description="PDF del cierre diario de cobranza declarado."
          format="pdf"
          comingSoon
          tooltip="Próximamente"
        />

        <ReportCard
          title="Recibos"
          description="PDF del recibo de un pago."
          format="pdf"
          comingSoon
          tooltip="Disponible desde el detalle del pago"
        />
      </section>
    </div>
  );
}
