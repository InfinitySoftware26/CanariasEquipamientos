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
import { useUpdateRouteSheetItem } from "@/hooks/route-sheets/useUpdateRouteSheetItem";
import { updateRouteSheetStatus } from "@/services/route-sheets/routeSheets.service";

import { RouteSheetItemCard } from "@/components/route-sheets/RouteSheetItemCard";
import { RouteSheetItemResultModal } from "@/components/route-sheets/RouteSheetItemResult";

import {
  RouteSheetItem,
  RouteSheetItemResult,
} from "@/types/rotue-sheets/routeSheets.types";

interface ItemResultData {
  result: RouteSheetItemResult;
  collectedAmount?: number;
  notes?: string;
  failedVisitReason?:
    | "client_absent"
    | "refused_payment"
    | "wrong_address"
    | "other";
}

export default function CollectorRouteSheetDetailPage() {
  const params = useParams<{ id: string }>();

  const routeSheetId = params.id;

  const [selectedItem, setSelectedItem] = useState<RouteSheetItem | null>(null);

  const [closingRoute, setClosingRoute] = useState(false);
  const [closeError, setCloseError] = useState("");

  const {
    routeSheet,
    loading: loadingSheet,
    error: sheetError,
    reload: reloadSheet,
  } = useRouteSheet(routeSheetId);

  const { loading: updating, update } = useUpdateRouteSheetItem();

  /**
   * IMPORTANTE:
   *
   * Ya no usamos useRouteSheetItems() acá.
   *
   * /route-sheets/:id ya devuelve:
   * {
   *   ...routeSheet,
   *   items: [...]
   * }
   *
   * Esto evita perder los datos enriquecidos que vienen
   * desde el detalle de la hoja.
   */
  const items = useMemo<RouteSheetItem[]>(() => {
    if (!routeSheet?.items) {
      return [];
    }

    return routeSheet.items;
  }, [routeSheet]);

  const report = useMemo(() => {
    const completed = items.filter(
      (item) => item.result === RouteSheetItemResult.COMPLETED,
    );

    const failed = items.filter(
      (item) => item.result === RouteSheetItemResult.FAILED,
    );

    const pending = items.filter(
      (item) => item.result === RouteSheetItemResult.PENDING,
    );

    const totalCollected = completed.reduce((total, item) => {
      if (item.itemType !== "installment") {
        return total;
      }

      return total + Number(item.collectedAmount ?? 0);
    }, 0);

    return {
      total: items.length,
      completed,
      failed,
      pending,
      totalCollected,
    };
  }, [items]);

  /**
   * La ruta SOLO puede cerrarse cuando:
   *
   * - tiene items
   * - no queda ningún item pendiente
   */
  const canCompleteRoute = items.length > 0 && report.pending.length === 0;

  if (!routeSheetId) {
    return <div className="p-6 text-red-400">ID de hoja de ruta inválido.</div>;
  }

  if (loadingSheet) {
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

    /**
     * Normalizamos el monto antes de enviarlo.
     *
     * El backend espera un número.
     */
    let collectedAmount: number | undefined;

    if (data.collectedAmount !== undefined && data.collectedAmount !== null) {
      collectedAmount = Number(data.collectedAmount);

      if (!Number.isFinite(collectedAmount)) {
        throw new Error("El monto ingresado no es válido.");
      }

      if (collectedAmount < 0) {
        throw new Error("El monto no puede ser negativo.");
      }

      /**
       * Para una cobranza no permitimos cobrar más que el saldo
       * de la cuota que tenemos disponible en el item.
       *
       * Esto además evita enviar accidentalmente valores como
       * 25448113 cuando la cuota es 32583.33.
       */
      if (
        selectedItem.itemType === "installment" &&
        selectedItem.installmentAmount !== null &&
        selectedItem.installmentAmount !== undefined &&
        collectedAmount > Number(selectedItem.installmentAmount)
      ) {
        throw new Error(
          `El monto ingresado ($${collectedAmount.toLocaleString("es-AR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}) supera el importe de la cuota ($${Number(
            selectedItem.installmentAmount,
          ).toLocaleString("es-AR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}).`,
        );
      }

      /**
       * Evitamos errores de precisión de floating point.
       */
      collectedAmount =
        Math.round((collectedAmount + Number.EPSILON) * 100) / 100;
    }

    await update(selectedItem.itemId, {
      result: data.result,
      collectedAmount,
      notes: data.notes?.trim() || undefined,
      failedVisitReason: data.failedVisitReason,
    });

    setSelectedItem(null);

    await reloadSheet();
  }

  async function handleCompleteRoute() {
    if (!canCompleteRoute) {
      return;
    }

    try {
      setClosingRoute(true);
      setCloseError("");

      await updateRouteSheetStatus(routeSheetId, {
        status: "completed",
      });

      await reloadSheet();
    } catch (error) {
      console.error(error);

      setCloseError(
        error instanceof Error
          ? error.message
          : "No se pudo completar la hoja de ruta.",
      );
    } finally {
      setClosingRoute(false);
    }
  }

  const isRouteCompleted = routeSheet.status === "completed";
  const isRouteCancelled = routeSheet.status === "cancelled";

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
                  : isRouteCancelled
                    ? "bg-red-500/15 text-red-400"
                    : "bg-yellow-500/15 text-yellow-300"
              }
            `}
          >
            {isRouteCompleted
              ? "Ruta finalizada"
              : isRouteCancelled
                ? "Ruta cancelada"
                : "Ruta en curso"}
          </span>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div>
            <p className="text-xs text-white/40">Fecha</p>

            <p className="mt-1 text-white">{routeSheet.routeDate}</p>
          </div>

          <div>
            <p className="text-xs text-white/40">Zona</p>

            <p className="mt-1 text-white">
              {routeSheet.zoneName || "No disponible"}
            </p>
          </div>

          <div>
            <p className="text-xs text-white/40">Estado</p>

            <p className="mt-1 text-white">
              {formatRouteStatus(routeSheet.status)}
            </p>
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

      {/* CERRAR RUTA */}
      {!isRouteCompleted && !isRouteCancelled && (
        <section className="rounded-3xl border border-white/10 bg-[#101927] p-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">
                Finalizar hoja de ruta
              </h2>

              {canCompleteRoute ? (
                <p className="mt-1 text-sm text-emerald-400">
                  Todas las visitas fueron procesadas. La ruta puede
                  finalizarse.
                </p>
              ) : (
                <p className="mt-1 text-sm text-yellow-300">
                  Todavía quedan {report.pending.length} visita
                  {report.pending.length === 1 ? "" : "s"} pendiente
                  {report.pending.length === 1 ? "" : "s"}.
                </p>
              )}

              {closeError && (
                <p className="mt-2 text-sm text-red-400">{closeError}</p>
              )}
            </div>

            <button
              type="button"
              disabled={!canCompleteRoute || closingRoute}
              onClick={handleCompleteRoute}
              className="
                inline-flex
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-emerald-500
                px-5
                py-3
                font-semibold
                text-white
                transition
                hover:bg-emerald-400
                disabled:cursor-not-allowed
                disabled:opacity-40
              "
            >
              <CheckCircle2 size={18} />

              {closingRoute ? "Finalizando..." : "Marcar ruta como completa"}
            </button>
          </div>
        </section>
      )}

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
            No hay visitas en esta hoja de ruta.
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
              <span className="text-white">
                $
                {Number(item.installmentAmount).toLocaleString("es-AR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
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

function formatRouteStatus(status: string) {
  switch (status) {
    case "pending":
      return "Pendiente";

    case "in_progress":
      return "En curso";

    case "completed":
      return "Completada";

    case "cancelled":
      return "Cancelada";

    default:
      return status;
  }
}
