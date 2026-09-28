"use client";

import { useEffect, useMemo, useState } from "react";

import { useParams } from "next/navigation";

import { Plus, Trash2 } from "lucide-react";

import {
  AvailableRouteSheetInstallment,
  RouteSheetItem,
  RouteSheetStatus,
} from "@/types/rotue-sheets/routeSheets.types";

import { StaffRole } from "@/types/auth.types";

import { RouteSheetHeader } from "@/components/route-sheets/RouteSheetHeader";

import { RouteSheetItemCard } from "@/components/route-sheets/RouteSheetItemCard";

import { RouteSheetItemResult } from "@/components/route-sheets/RouteSheetItemResult";

import { AddButton } from "@/components/button/AddButton";

import { DangerButton } from "@/components/button/DangerButton";

import { useRouteSheet } from "@/hooks/route-sheets/useRouteSheet";

import { useUpdateRouteSheetStatus } from "@/hooks/route-sheets/useUpdateRouteSheetStatus";

import {
  addInstallmentToRouteSheet,
  getAvailableInstallmentsForRouteSheet,
} from "@/services/route-sheets/routeSheets.service";

import { useAuthStore } from "@/store/auth.store";

import { removeRouteSheetItem } from "@/services/route-sheets/routeSheetsItems.service";

function formatCurrency(value: number | null | undefined) {
  return `$${Number(value ?? 0).toLocaleString("es-AR", {
    minimumFractionDigits: 2,

    maximumFractionDigits: 2,
  })}`;
}

function formatDateOnly(value: string) {
  const datePart = value.slice(0, 10);

  const [year, month, day] = datePart.split("-");

  if (!year || !month || !day) {
    return value;
  }

  return `${day}/${month}/${year}`;
}

export default function RouteSheetDetailPage() {
  const params = useParams<{
    id: string;
  }>();

  const routeSheetId = params.id;

  const { routeSheet, loading, error, reload } = useRouteSheet(routeSheetId);

  const { update: updateStatus } = useUpdateRouteSheetStatus();

  const activeRole = useAuthStore((state) => state.activeRole);

  const [selectedItem, setSelectedItem] = useState<RouteSheetItem | null>(null);

  const [availableInstallments, setAvailableInstallments] = useState<
    AvailableRouteSheetInstallment[]
  >([]);

  const [selectedInstallmentId, setSelectedInstallmentId] = useState("");

  const [loadingAvailable, setLoadingAvailable] = useState(false);

  const [adding, setAdding] = useState(false);

  const [removingItemId, setRemovingItemId] = useState<string | null>(null);

  const [actionError, setActionError] = useState("");

  // ============================================================
  // PERMISOS
  // ============================================================

  const canManageSheet = useMemo(
    () =>
      activeRole === StaffRole.ADMIN ||
      activeRole === StaffRole.MANAGER ||
      activeRole === StaffRole.SUPER_ADMIN,
    [activeRole],
  );

  const canEditItems =
    canManageSheet &&
    routeSheet?.status !== RouteSheetStatus.COMPLETED &&
    routeSheet?.status !== RouteSheetStatus.CANCELLED;

  // ============================================================
  // CUOTAS DISPONIBLES
  // ============================================================

  async function loadAvailableInstallments() {
    if (!canEditItems || !routeSheetId) {
      setAvailableInstallments([]);

      return;
    }

    try {
      setLoadingAvailable(true);

      setActionError("");

      const data = await getAvailableInstallmentsForRouteSheet(routeSheetId);

      setAvailableInstallments(data);

      if (
        selectedInstallmentId &&
        !data.some((item) => item.installmentId === selectedInstallmentId)
      ) {
        setSelectedInstallmentId("");
      }
    } catch (err) {
      console.error("Error obteniendo cuotas disponibles:", err);

      setAvailableInstallments([]);

      setActionError(
        err instanceof Error
          ? err.message
          : "No se pudieron obtener las cuotas disponibles.",
      );
    } finally {
      setLoadingAvailable(false);
    }
  }

  useEffect(() => {
    void loadAvailableInstallments();
  }, [routeSheetId, canEditItems, routeSheet?.items.length]);

  // ============================================================
  // AGREGAR CUOTA
  // ============================================================

  async function handleAddInstallment() {
    if (!selectedInstallmentId) {
      return;
    }

    try {
      setAdding(true);

      setActionError("");

      await addInstallmentToRouteSheet(routeSheetId, {
        installmentId: selectedInstallmentId,
      });

      setSelectedInstallmentId("");

      await reload();

      await loadAvailableInstallments();
    } catch (err) {
      console.error("Error agregando cuota a la hoja:", err);

      setActionError(
        err instanceof Error
          ? err.message
          : "No se pudo agregar la cuota a la hoja.",
      );
    } finally {
      setAdding(false);
    }
  }

  // ============================================================
  // QUITAR ITEM
  // ============================================================

  async function handleRemoveItem(item: RouteSheetItem) {
    if (item.result !== "pending") {
      return;
    }

    const confirmed = window.confirm(
      `¿Quitar a ${item.clientName ?? "este cliente"} de esta hoja de ruta?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setRemovingItemId(item.itemId);

      setActionError("");

      await removeRouteSheetItem(item.itemId);

      await reload();

      await loadAvailableInstallments();
    } catch (err) {
      console.error("Error quitando item de la hoja:", err);

      setActionError(
        err instanceof Error
          ? err.message
          : "No se pudo quitar el item de la hoja.",
      );
    } finally {
      setRemovingItemId(null);
    }
  }

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return <div className="text-white">Cargando...</div>;
  }

  // ============================================================
  // ERROR
  // ============================================================

  if (error || !routeSheet) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5 text-red-300">
        {error || "No se pudo cargar la hoja de ruta."}
      </div>
    );
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="space-y-6">
      {/* HEADER */}

      <RouteSheetHeader
        routeSheet={routeSheet}
        onStatusChange={async (status: RouteSheetStatus) => {
          await updateStatus(routeSheet.routeSheetId, status);

          await reload();
        }}
      />

      {/* ADMINISTRACIÓN DE ITEMS */}

      {canEditItems && (
        <section className="rounded-2xl border border-white/10 bg-[#101927] p-5 shadow-lg">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">
                Agregar cliente a la hoja
              </h2>

              <p className="mt-1 text-sm text-white/50">
                Se muestran cuotas abiertas de ventas cerradas que pertenecen a
                la misma zona y que todavía no están en otra hoja activa.
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 sm:flex-row lg:max-w-3xl">
              <select
                value={selectedInstallmentId}
                disabled={loadingAvailable || adding}
                onChange={(event) =>
                  setSelectedInstallmentId(event.target.value)
                }
                className="min-h-11 flex-1 rounded-xl border border-white/10 bg-[#0B1220] px-4 text-sm text-white outline-none focus:border-cyan-500/50"
              >
                <option value="">
                  {loadingAvailable
                    ? "Cargando cuotas disponibles..."
                    : "Seleccionar cliente / cuota"}
                </option>

                {availableInstallments.map((item) => (
                  <option key={item.installmentId} value={item.installmentId}>
                    {item.clientName ?? "Cliente"} — Cuota{" "}
                    {item.installmentNumber} —{" "}
                    {formatCurrency(item.totalToCollect)} — vence{" "}
                    {formatDateOnly(item.dueDate)}
                  </option>
                ))}
              </select>

              <AddButton
                type="button"
                disabled={!selectedInstallmentId || loadingAvailable || adding}
                onClick={handleAddInstallment}
                className="inline-flex min-w-40 items-center justify-center gap-2"
              >
                <Plus size={17} />

                {adding ? "Agregando..." : "Agregar"}
              </AddButton>
            </div>
          </div>

          {!loadingAvailable && availableInstallments.length === 0 && (
            <p className="mt-4 text-sm text-white/40">
              No hay cuotas disponibles para agregar a esta hoja.
            </p>
          )}

          {actionError && (
            <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-300">
              {actionError}
            </div>
          )}
        </section>
      )}

      {/* ITEMS */}

      <div className="grid gap-4">
        {routeSheet.items.length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-[#101927] p-6 text-center text-sm text-white/50">
            Esta hoja todavía no tiene visitas asignadas.
          </div>
        )}

        {routeSheet.items.map((item) => (
          <div key={item.itemId} className="space-y-2">
            <RouteSheetItemCard
              item={item}
              onAction={() => setSelectedItem(item)}
            />

            {canEditItems && item.result === "pending" && (
              <div className="flex justify-end">
                <DangerButton
                  type="button"
                  size="sm"
                  disabled={removingItemId === item.itemId}
                  onClick={() => handleRemoveItem(item)}
                  className="inline-flex items-center gap-2 px-4 py-2"
                >
                  <Trash2 size={16} />

                  {removingItemId === item.itemId
                    ? "Quitando..."
                    : "Quitar de la hoja"}
                </DangerButton>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* MODAL */}

      {selectedItem && (
        <RouteSheetItemResult
          item={selectedItem}
          open={Boolean(selectedItem)}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedItem(null);
            }
          }}
          onSuccess={async () => {
            setSelectedItem(null);

            await reload();

            await loadAvailableInstallments();
          }}
        />
      )}
    </div>
  );
}
