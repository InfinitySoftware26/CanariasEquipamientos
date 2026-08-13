"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  CheckCircle2,
  Clock3,
  DollarSign,
  FileText,
  XCircle,
} from "lucide-react";

import { useRouteSheet } from "@/hooks/route-sheets/useRouteSheet";
import { useRouteSheetItems } from "@/hooks/route-sheets/useRouteSheetsItems";
import { useUpdateRouteSheetItem } from "@/hooks/route-sheets/useUpdateRouteSheetItem";

import { RouteSheetItemCard } from "@/components/route-sheets/RouteSheetItemCard";

import {
  RouteSheetItem,
  RouteSheetItemResult,
} from "@/types/rotue-sheets/routeSheets.types";
import { RouteSheetItemResultModal } from "@/components/route-sheets/RouteSheetItemResult";

interface ItemResultData {
  result: RouteSheetItemResult;
  collectedAmount?: number;
  notes?: string;
}

export default function CollectorRouteSheetDetailPage() {
  const params = useParams<{ id: string }>();

  const routeSheetId = params.id;

  const [selectedItem, setSelectedItem] = useState<RouteSheetItem | null>(null);

  const {
    routeSheet,
    loading: loadingSheet,
    error: sheetError,
    reload: reloadSheet,
  } = useRouteSheet(routeSheetId);

  const {
    items,
    loading: loadingItems,
    reload,
  } = useRouteSheetItems(routeSheetId);

  const { loading: updating, update } = useUpdateRouteSheetItem();

  const report = useMemo(() => {
    const completed = items.filter((item) => item.result === "completed");

    const failed = items.filter((item) => item.result === "failed");

    const pending = items.filter((item) => item.result === "pending");

    const totalCollected = completed.reduce((total, item) => {
      if (item.itemType !== "installment") {
        return total;
      }

      return total + Number(item.collectedAmount || 0);
    }, 0);

    return {
      total: items.length,
      completed,
      failed,
      pending,
      totalCollected,
    };
  }, [items]);

  if (!routeSheetId) {
    return <div className="p-6 text-red-400">ID de hoja de ruta inválido.</div>;
  }

  if (loadingSheet || loadingItems) {
    return <div className="p-6 text-white">Cargando hoja de ruta...</div>;
  }

  if (sheetError || !routeSheet) {
    return (
      <div className="p-6 text-red-400">No se pudo cargar la hoja de ruta.</div>
    );
  }

  async function handleItemResult(data: ItemResultData) {
    if (!selectedItem) {
      return;
    }

    await update(selectedItem.itemId, {
      result: data.result,
      collectedAmount: data.collectedAmount,
      notes: data.notes,
    });

    setSelectedItem(null);

    await reload();
    await reloadSheet();
  }

  const isRouteCompleted = routeSheet.status === "completed";

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <section className="rounded-3xl border border-white/10 bg-gradient-to-r from-[#10254A] via-[#16315F] to-[#21457A] p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm text-white/50">Hoja de ruta</p>

            <h1 className="mt-1 text-3xl font-bold text-white">
              Recorrido del día
            </h1>
          </div>

          <span
            className={`
              inline-flex
              w-fit
              rounded-full
              px-4
              py-2
              text-sm
              font-semibold
              ${
                isRouteCompleted
                  ? "bg-emerald-500/15 text-emerald-400"
                  : "bg-yellow-500/15 text-yellow-300"
              }
            `}
          >
            {isRouteCompleted ? "Ruta finalizada" : "Ruta en curso"}
          </span>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div>
            <p className="text-xs text-white/40">Fecha</p>

            <p className="mt-1 text-white">{routeSheet.routeDate}</p>
          </div>

          <div>
            <p className="text-xs text-white/40">Zona</p>

            <p className="mt-1 text-white">{routeSheet.zoneName}</p>
          </div>

          <div>
            <p className="text-xs text-white/40">Estado</p>

            <p className="mt-1 text-white">{routeSheet.status}</p>
          </div>
        </div>
      </section>

      {/* RESUMEN */}
      <section>
        <div className="mb-4 flex items-center gap-2">
          <FileText size={20} className="text-cyan-400" />

          <h2 className="text-xl font-semibold text-white">
            Resumen de la ruta
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <SummaryCard
            icon={<FileText size={20} />}
            label="Total visitas"
            value={report.total}
          />

          <SummaryCard
            icon={<CheckCircle2 size={20} />}
            label="Completadas"
            value={report.completed.length}
          />

          <SummaryCard
            icon={<XCircle size={20} />}
            label="Fallidas"
            value={report.failed.length}
          />

          <SummaryCard
            icon={<Clock3 size={20} />}
            label="Pendientes"
            value={report.pending.length}
          />

          <SummaryCard
            icon={<DollarSign size={20} />}
            label="Total cobrado"
            value={`$${report.totalCollected.toLocaleString("es-AR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`}
          />
        </div>
      </section>

      {/* REPORTE FINAL */}
      {isRouteCompleted && (
        <section className="space-y-5 rounded-3xl border border-emerald-500/20 bg-emerald-500/5 p-6">
          <div>
            <h2 className="text-xl font-semibold text-white">
              Reporte final de la ruta
            </h2>

            <p className="mt-1 text-sm text-white/50">
              Resultado de todas las visitas realizadas durante el recorrido.
            </p>
          </div>

          {/* COMPLETADAS */}
          <div className="rounded-2xl border border-white/10 bg-[#101927] p-5">
            <div className="mb-4 flex items-center gap-2">
              <CheckCircle2 size={20} className="text-emerald-400" />

              <h3 className="font-semibold text-white">
                Ventas / visitas completadas
              </h3>

              <span className="ml-auto rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400">
                {report.completed.length}
              </span>
            </div>

            {report.completed.length === 0 ? (
              <p className="text-sm text-white/40">
                No hubo visitas completadas.
              </p>
            ) : (
              <div className="space-y-3">
                {report.completed.map((item) => (
                  <ReportItem key={item.itemId} item={item} type="completed" />
                ))}
              </div>
            )}
          </div>

          {/* FALLIDAS */}
          <div className="rounded-2xl border border-white/10 bg-[#101927] p-5">
            <div className="mb-4 flex items-center gap-2">
              <XCircle size={20} className="text-red-400" />

              <h3 className="font-semibold text-white">
                Ventas / visitas fallidas
              </h3>

              <span className="ml-auto rounded-full bg-red-500/10 px-3 py-1 text-xs text-red-400">
                {report.failed.length}
              </span>
            </div>

            {report.failed.length === 0 ? (
              <p className="text-sm text-emerald-400">
                No hubo visitas fallidas.
              </p>
            ) : (
              <div className="space-y-3">
                {report.failed.map((item) => (
                  <ReportItem key={item.itemId} item={item} type="failed" />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* RECORRIDO */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-white">
            Recorrido del día
          </h2>

          <p className="mt-1 text-sm text-white/50">
            Gestioná cada visita desde su tarjeta.
          </p>
        </div>

        {items.length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white/60">
            No hay visitas pendientes.
          </div>
        )}

        <div className="grid gap-5">
          {items.map((item) => (
            <RouteSheetItemCard
              key={item.itemId}
              item={item}
              onAction={() => setSelectedItem(item)}
            />
          ))}
        </div>
      </section>

      {/* MODAL */}
      <RouteSheetItemResultModal
        item={selectedItem}
        loading={updating}
        onClose={() => {
          if (!updating) {
            setSelectedItem(null);
          }
        }}
        onSubmit={handleItemResult}
      />
    </div>
  );
}

interface SummaryCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}

function SummaryCard({ icon, label, value }: SummaryCardProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#101927] p-4">
      <div className="flex items-center gap-2 text-cyan-400">
        {icon}

        <span className="text-xs text-white/50">{label}</span>
      </div>

      <p className="mt-3 text-2xl font-bold text-white">{value}</p>
    </div>
  );
}

interface ReportItemProps {
  item: RouteSheetItem;
  type: "completed" | "failed";
}

function ReportItem({ item, type }: ReportItemProps) {
  const amount =
    item.collectedAmount !== null && item.collectedAmount !== undefined
      ? Number(item.collectedAmount)
      : 0;

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="font-semibold text-white">
            {item.clientName || "Cliente no disponible"}
          </p>

          <p className="mt-1 text-xs text-white/40">
            DNI: {item.clientDocumentNumber || "No disponible"}
          </p>

          <p className="mt-1 text-xs text-white/40">
            {item.itemType === "installment" ? "Cobranza de cuota" : "Entrega"}
          </p>
        </div>

        {item.itemType === "installment" && type === "completed" && (
          <div className="text-left md:text-right">
            <p className="text-xs text-white/40">Cobrado</p>

            <p className="text-lg font-bold text-emerald-400">
              $
              {amount.toLocaleString("es-AR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
        )}
      </div>

      <div className="mt-3 grid gap-2 text-sm md:grid-cols-2">
        {item.installmentAmount !== null &&
          item.installmentAmount !== undefined && (
            <p className="text-white/60">
              Cuota prevista:{" "}
              <span className="text-white">${item.installmentAmount}</span>
            </p>
          )}

        {item.visitedAt && (
          <p className="text-white/60">
            Visitado:{" "}
            <span className="text-white">
              {new Date(item.visitedAt).toLocaleString("es-AR")}
            </span>
          </p>
        )}
      </div>

      {item.notes && (
        <div
          className={`
            mt-3
            rounded-lg
            px-3
            py-2
            text-sm
            ${
              type === "failed"
                ? "bg-red-500/10 text-red-300"
                : "bg-white/5 text-white/60"
            }
          `}
        >
          <span className="font-medium">Observación:</span> {item.notes}
        </div>
      )}
    </div>
  );
}
