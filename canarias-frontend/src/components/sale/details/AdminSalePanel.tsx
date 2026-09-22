"use client";

import { useEffect, useState } from "react";

import { Sale } from "@/types/sales/sale.type";
import { Collector } from "@/types/collector/collector.type";

import {
  adminValidateSale,
  assignCollector,
  closeSale,
  scheduleDeliveryDate,
  updateSaleObservation,
} from "@/services/sales.service";

import { getCollectors } from "@/services/collectors/collectors.services";

import { generateRouteSheets } from "@/services/route-sheets/routeSheets.service";

import { getSaleStatusLabel } from "@/lib/sales/getSalesStatusLabel";

import { SaleStatusBadge } from "../SalesStatusBadge";

import { AddButton } from "@/components/button/AddButton";

import { DangerButton } from "@/components/button/DangerButton";

import { SaveButton } from "@/components/button/SaveButton";

import { EditButton } from "@/components/button/EditButton";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CollectionScheduleForm } from "./CollectorScheduleForm";

interface Props {
  sale: Sale;

  onRefresh: () => void | Promise<void>;
}

function formatCalendarDate(value?: string | null) {
  if (!value) {
    return "-";
  }

  const datePart = value.split("T")[0];

  const [year, month, day] = datePart.split("-").map(Number);

  if (!year || !month || !day) {
    return "-";
  }

  return new Date(year, month - 1, day).toLocaleDateString("es-AR");
}

function getToday() {
  const now = new Date();

  const year = now.getFullYear();

  const month = String(now.getMonth() + 1).padStart(2, "0");

  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function AdminSalePanel({ sale, onRefresh }: Props) {
  const [loading, setLoading] = useState(false);

  const [observation, setObservation] = useState(sale.observation ?? "");

  const [collectors, setCollectors] = useState<Collector[]>([]);

  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);

  const [approveDialogOpen, setApproveDialogOpen] = useState(false);

  const [closeDialogOpen, setCloseDialogOpen] = useState(false);

  const [environmentalConfirmOpen, setEnvironmentalConfirmOpen] =
    useState(false);

  const [deliveryConfirmOpen, setDeliveryConfirmOpen] = useState(false);

  const [selectedCollector, setSelectedCollector] = useState(
    sale.assignedCollectorId ?? "",
  );

  const [deliveryDate, setDeliveryDate] = useState(
    sale.deliveryDate?.split("T")[0] ?? "",
  );

  const badge = getSaleStatusLabel(sale.status);

  const canValidate = sale.status === "pending_admin_validation";

  const canAssign =
    sale.status === "pending_environmental_visit" ||
    sale.status === "pending_delivery";

  const canScheduleDelivery = sale.status === "pending_delivery";

  const canClose = sale.status === "delivered";

  const isClosed = sale.status === "closed";

  useEffect(() => {
    setObservation(sale.observation ?? "");

    setSelectedCollector(sale.assignedCollectorId ?? "");

    setDeliveryDate(sale.deliveryDate?.split("T")[0] ?? "");
  }, [sale.observation, sale.assignedCollectorId, sale.deliveryDate]);

  useEffect(() => {
    async function loadCollectors() {
      try {
        const data = await getCollectors();

        setCollectors(data);
      } catch (error) {
        console.error(error);
      }
    }

    void loadCollectors();
  }, []);

  async function saveObservation() {
    try {
      setLoading(true);

      await updateSaleObservation(sale.saleId, observation);

      await onRefresh();
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "No se pudo guardar la observación.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function validate(result: "approved" | "rejected") {
    if (result === "rejected" && !observation.trim()) {
      alert("Debe ingresar una observación para rechazar.");

      return;
    }

    if (result === "approved") {
      setEnvironmentalConfirmOpen(true);

      return;
    }

    try {
      setLoading(true);

      await adminValidateSale(sale.saleId, result, observation);

      await onRefresh();
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error ? error.message : "No se pudo validar la venta.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function confirmEnvironmentalApproval() {
    try {
      setLoading(true);

      await adminValidateSale(sale.saleId, "approved", observation);

      setEnvironmentalConfirmOpen(false);

      await onRefresh();
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error ? error.message : "No se pudo aprobar la venta.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleAssign() {
    if (!selectedCollector) {
      alert("Seleccione un cobrador.");

      return;
    }

    try {
      setLoading(true);

      await assignCollector(sale.saleId, selectedCollector);

      await onRefresh();
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "No se pudo asignar el cobrador.",
      );
    } finally {
      setLoading(false);
    }
  }

  function scheduleDelivery() {
    if (!deliveryDate) {
      alert("Seleccione una fecha de entrega.");

      return;
    }

    if (!sale.assignedCollectorId) {
      alert("Debe asignar un cobrador antes de coordinar la entrega.");

      return;
    }

    setDeliveryConfirmOpen(true);
  }

  async function confirmScheduleDelivery() {
    try {
      setLoading(true);

      // 1. Guardamos la fecha de entrega y generamos las cuotas.
      await scheduleDeliveryDate(sale.saleId, deliveryDate);

      // 2. Generamos inmediatamente la hoja de ruta para esa fecha.
      // Así el cobrador no depende del cron de las 06:00.
      const generation = await generateRouteSheets({
        routeDate: deliveryDate,
      });

      const deliveriesFound = Number(generation.deliveriesFound ?? 0);

      // Si no se encontró ninguna entrega, la fecha quedó guardada pero
      // el flujo operativo está incompleto. Lo mostramos de forma explícita.
      if (deliveriesFound === 0) {
        throw new Error(
          "La fecha se guardó, pero no se encontró una entrega para generar la hoja de ruta. Verificá que la venta tenga cobrador asignado y que el cliente tenga una zona configurada.",
        );
      }

      // generateDaily() no siempre lanza una excepción: cuando una combinación
      // zona/cobrador es inválida, puede devolverla dentro de skippedGroups.
      // Por eso inspeccionamos el resultado y mostramos el motivo real.
      if (generation.created === 0 && generation.skipped > 0) {
        const onlyExistingSheet = generation.skippedGroups.every((group) =>
          group.reason.toLowerCase().includes("la hoja ya existía"),
        );

        if (!onlyExistingSheet) {
          const reasons = generation.skippedGroups
            .map((group) => group.reason)
            .filter(Boolean)
            .join(" | ");

          throw new Error(
            reasons ||
              "La fecha se guardó, pero no se pudo generar la hoja de ruta del cobrador.",
          );
        }
      }

      setDeliveryConfirmOpen(false);

      await onRefresh();
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "No se pudo coordinar la entrega.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleClose() {
    try {
      setLoading(true);

      await closeSale(sale.saleId, deliveryDate || undefined);

      setCloseDialogOpen(false);

      await onRefresh();
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error ? error.message : "No se pudo cerrar la venta.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-3xl border border-white/10 bg-[#111827] shadow-xl">
      <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
        <div>
          <h2 className="text-lg font-semibold text-white">
            Gestión administrativa
          </h2>

          <p className="mt-1 text-sm text-white/50">
            Control del flujo de venta.
          </p>
        </div>

        <SaleStatusBadge {...badge} />
      </div>

      <div className="space-y-6 p-6">
        <div className="rounded-2xl border border-[#F5A300]/20 bg-[#F5A300]/10 p-4">
          <p className="text-sm font-semibold text-[#F5A300]">Paso actual</p>

          {sale.status === "pending_admin_validation" && (
            <p className="mt-2 text-white/80">
              Revisá la información de la venta y decidí si la operación
              continúa.
            </p>
          )}

          {sale.status === "pending_environmental_visit" && (
            <p className="mt-2 text-white/80">
              La venta fue aprobada. Asigná cobrador, realizá la visita
              ambiental y registrá la entrega de documentación.
            </p>
          )}

          {sale.status === "pending_delivery" && (
            <p className="mt-2 text-white/80">
              Coordiná la fecha de entrega. El cobrador deberá entregar el
              producto y cobrar la primera cuota.
            </p>
          )}

          {sale.status === "delivered" && (
            <p className="mt-2 text-white/80">
              El producto y la primera cuota fueron registrados. Una vez
              recibida la rendición, podés cerrar la venta.
            </p>
          )}

          {sale.status === "closed" && (
            <p className="mt-2 text-emerald-300">
              La venta está cerrada. Ahora configurá la cobranza recurrente.
            </p>
          )}
        </div>

        {sale.status !== "pending_admin_validation" &&
          sale.status !== "rejected_admin" &&
          sale.status !== "environmental_rejected" && (
            <div className="rounded-2xl border border-white/10 p-5">
              <h3 className="font-semibold text-white">Estado operativo</h3>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-white/5 p-4">
                  <p className="text-xs text-white/40">Cobrador</p>

                  <p
                    className={`mt-1 font-semibold ${
                      sale.assignedCollectorId
                        ? "text-emerald-300"
                        : "text-amber-300"
                    }`}
                  >
                    {sale.assignedCollectorId ? "Asignado ✓" : "Pendiente"}
                  </p>
                </div>

                <div className="rounded-xl bg-white/5 p-4">
                  <p className="text-xs text-white/40">Fecha de entrega</p>

                  <p className="mt-1 font-semibold text-white">
                    {sale.deliveryDate
                      ? formatCalendarDate(sale.deliveryDate)
                      : "Pendiente"}
                  </p>
                </div>

                <div className="rounded-xl bg-white/5 p-4">
                  <p className="text-xs text-white/40">Producto</p>

                  <p className="mt-1 font-semibold text-white">
                    {sale.status === "delivered" || sale.status === "closed"
                      ? "Entregado ✓"
                      : "Pendiente"}
                  </p>
                </div>

                <div className="rounded-xl bg-white/5 p-4">
                  <p className="text-xs text-white/40">Primera cuota</p>

                  <p className="mt-1 font-semibold text-white">
                    {sale.status === "delivered" || sale.status === "closed"
                      ? "Cobro registrado ✓"
                      : "Pendiente"}
                  </p>
                </div>

                <div className="rounded-xl bg-white/5 p-4">
                  <p className="text-xs text-white/40">Cierre</p>

                  <p className="mt-1 font-semibold text-white">
                    {isClosed ? "Cerrada ✓" : "Pendiente"}
                  </p>
                </div>
              </div>
            </div>
          )}

        <div>
          <label className="mb-2 block text-sm text-white/60">
            Observaciones
          </label>

          <textarea
            value={observation}
            onChange={(e) => setObservation(e.target.value)}
            rows={4}
            className="w-full rounded-2xl bg-[#0B1220] p-4 text-white"
          />

          <div className="mt-3">
            <SaveButton disabled={loading} onClick={saveObservation}>
              Guardar observación
            </SaveButton>
          </div>
        </div>

        {canValidate && (
          <div className="space-y-3 rounded-2xl border border-white/10 p-5">
            <h3 className="font-semibold text-white">
              Validación administrativa
            </h3>

            <div className="flex gap-3">
              <DangerButton
                disabled={loading}
                onClick={() => setRejectDialogOpen(true)}
              >
                Rechazar venta
              </DangerButton>

              <AddButton
                disabled={loading}
                onClick={() => setApproveDialogOpen(true)}
              >
                Aprobar venta
              </AddButton>
            </div>
          </div>
        )}

        {canAssign && (
          <div className="space-y-4 rounded-2xl border border-white/10 p-5">
            <h3 className="font-semibold text-white">Asignar cobrador</h3>

            <Select
              value={selectedCollector}
              onValueChange={setSelectedCollector}
            >
              <SelectTrigger className="w-full border-white/10 bg-white/5 text-white">
                <SelectValue placeholder="Seleccionar cobrador" />
              </SelectTrigger>

              <SelectContent>
                {collectors.map((collector) => (
                  <SelectItem key={collector.staffId} value={collector.staffId}>
                    {collector.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <AddButton
              disabled={loading}
              onClick={handleAssign}
              className="w-full"
            >
              Asignar cobrador
            </AddButton>
          </div>
        )}

        {canScheduleDelivery && (
          <div className="space-y-4 rounded-2xl border border-blue-500/20 bg-blue-500/10 p-5">
            <h3 className="font-semibold text-blue-300">Coordinar entrega</h3>

            <input
              type="date"
              value={deliveryDate}
              min={getToday()}
              onChange={(e) => setDeliveryDate(e.target.value)}
              className="w-full rounded-xl bg-[#0B1220] p-3 text-white"
            />

            <AddButton
              disabled={loading || !sale.assignedCollectorId}
              onClick={scheduleDelivery}
              className="w-full"
            >
              Guardar coordinación
            </AddButton>
          </div>
        )}

        {canClose && (
          <div className="space-y-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5">
            <h3 className="font-semibold text-emerald-300">
              Cierre administrativo
            </h3>

            <p className="text-sm text-white/70">
              Cuando Administración reciba la rendición y el dinero del
              cobrador, cerrá la venta.
            </p>

            <EditButton disabled={loading} onClick={scheduleDelivery}>
              Actualizar fecha
            </EditButton>

            <AddButton
              disabled={loading}
              onClick={() => setCloseDialogOpen(true)}
              className="w-full"
            >
              Cerrar venta
            </AddButton>
          </div>
        )}

        {isClosed && (
          <CollectionScheduleForm sale={sale} onRefresh={onRefresh} />
        )}
      </div>

      <ConfirmDialog
        open={rejectDialogOpen}
        onOpenChange={setRejectDialogOpen}
        title="¿Está seguro que desea rechazar la venta?"
        description="Si rechazás la venta, asegurate de haber dejado una observación con el motivo."
        confirmText="Rechazar venta"
        cancelText="Cancelar"
        destructive
        loading={loading}
        onConfirm={() => validate("rejected")}
      />

      <ConfirmDialog
        open={approveDialogOpen}
        onOpenChange={setApproveDialogOpen}
        title="¿Está seguro que desea aprobar la venta?"
        description="La venta continuará a la etapa de visita ambiental."
        confirmText="Aprobar venta"
        cancelText="Cancelar"
        loading={loading}
        onConfirm={() => validate("approved")}
      />
      <ConfirmDialog
        open={closeDialogOpen}
        onOpenChange={setCloseDialogOpen}
        title="Cerrar venta"
        description="Confirmá únicamente después de recibir la rendición del cobrador."
        confirmText="Cerrar venta"
        cancelText="Cancelar"
        loading={loading}
        onConfirm={handleClose}
      />

      <ConfirmDialog
        open={environmentalConfirmOpen}
        onOpenChange={setEnvironmentalConfirmOpen}
        title="Confirmar aprobación administrativa"
        description="La venta continuará a la etapa de visita ambiental."
        onConfirm={confirmEnvironmentalApproval}
        confirmText="Confirmar aprobación"
        cancelText="Cancelar"
      />

      <ConfirmDialog
        open={deliveryConfirmOpen}
        onOpenChange={setDeliveryConfirmOpen}
        title="Confirmar fecha de entrega"
        description="Se guardará la fecha y se generará inmediatamente la hoja de ruta correspondiente para el cobrador."
        onConfirm={confirmScheduleDelivery}
        confirmText="Confirmar fecha"
        cancelText="Cancelar"
      />
    </section>
  );
}
