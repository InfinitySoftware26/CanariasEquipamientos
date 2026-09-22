"use client";

import { useState } from "react";

import { Sale } from "@/types/sales/sale.type";

import { envValidateSale } from "@/services/collectors/collectors.services";

import { getSaleStatusLabel } from "@/lib/sales/getSalesStatusLabel";

import { SaleStatusBadge } from "../SalesStatusBadge";

import { AddButton } from "@/components/button/AddButton";

import { DangerButton } from "@/components/button/DangerButton";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface Props {
  sale: Sale;

  onRefresh: () => void | Promise<void>;
}

export function CollectorSalePanel({ sale, onRefresh }: Props) {
  const [loading, setLoading] = useState(false);

  const [visitDialogOpen, setVisitDialogOpen] = useState(false);

  const [rejectVisitDialogOpen, setRejectVisitDialogOpen] = useState(false);

  // ============================================================
  // DOCUMENTACIÓN DE VISITA AMBIENTAL
  // ============================================================

  const [dniCopyReceived, setDniCopyReceived] = useState(false);

  const [salaryReceiptReceived, setSalaryReceiptReceived] = useState(false);

  const [otherDocumentsReceived, setOtherDocumentsReceived] = useState(false);

  const [visitObservation, setVisitObservation] = useState("");

  const badge = getSaleStatusLabel(sale.status);

  const canVisit = sale.status === "pending_environmental_visit";

  // ============================================================
  // APROBAR VISITA
  // ============================================================

  async function confirmVisit() {
    try {
      setLoading(true);

      await envValidateSale(sale.saleId, {
        status: "approved",

        observations: visitObservation.trim() || undefined,

        dniCopyReceived,

        salaryReceiptReceived,

        otherDocumentsReceived,
      });

      setVisitDialogOpen(false);

      await onRefresh();
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "No se pudo aprobar la visita ambiental.",
      );
    } finally {
      setLoading(false);
    }
  }

  // ============================================================
  // RECHAZAR VISITA
  // ============================================================

  async function rejectVisit() {
    if (!visitObservation.trim()) {
      alert("Debe ingresar una observación indicando el motivo del rechazo.");

      return;
    }

    try {
      setLoading(true);

      await envValidateSale(sale.saleId, {
        status: "rejected",

        observations: visitObservation.trim(),

        dniCopyReceived,

        salaryReceiptReceived,

        otherDocumentsReceived,
      });

      setRejectVisitDialogOpen(false);

      await onRefresh();
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "No se pudo rechazar la visita ambiental.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-3xl border border-white/10 bg-[#111827] shadow-xl">
      {/* HEADER */}

      <div className="flex justify-between border-b border-white/10 px-6 py-5">
        <div>
          <h2 className="font-semibold text-white">Gestión del cobrador</h2>

          <p className="mt-1 text-sm text-white/50">
            Acciones correspondientes al estado actual de la venta.
          </p>
        </div>

        <SaleStatusBadge {...badge} />
      </div>

      <div className="space-y-6 p-6">
        {/* ===================================================== */}
        {/* VISITA AMBIENTAL */}
        {/* ===================================================== */}

        {canVisit ? (
          <div className="space-y-5">
            <div>
              <h3 className="text-lg font-semibold text-white">
                Visita ambiental
              </h3>

              <p className="mt-2 text-sm text-white/60">
                Realizá la visita al domicilio y registrá la documentación que
                el cliente entrega.
              </p>
            </div>

            {/* DOCUMENTACIÓN */}

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="font-semibold text-white">Documentación recibida</p>

              <p className="mt-1 text-sm text-white/50">
                Marcá los documentos que recibiste durante la visita.
              </p>

              <div className="mt-5 space-y-4">
                {/* DNI */}

                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-black/10 p-4 text-white">
                  <input
                    type="checkbox"
                    checked={dniCopyReceived}
                    disabled={loading}
                    onChange={(event) =>
                      setDniCopyReceived(event.target.checked)
                    }
                    className="h-5 w-5"
                  />

                  <div>
                    <p className="font-medium">Fotocopia de DNI</p>

                    <p className="text-xs text-white/40">
                      Documentación de identidad del cliente.
                    </p>
                  </div>
                </label>

                {/* RECIBO SUELDO */}

                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-black/10 p-4 text-white">
                  <input
                    type="checkbox"
                    checked={salaryReceiptReceived}
                    disabled={loading}
                    onChange={(event) =>
                      setSalaryReceiptReceived(event.target.checked)
                    }
                    className="h-5 w-5"
                  />

                  <div>
                    <p className="font-medium">Recibo/s de sueldo</p>

                    <p className="text-xs text-white/40">
                      Comprobante de ingresos entregado por el cliente.
                    </p>
                  </div>
                </label>

                {/* OTROS */}

                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-black/10 p-4 text-white">
                  <input
                    type="checkbox"
                    checked={otherDocumentsReceived}
                    disabled={loading}
                    onChange={(event) =>
                      setOtherDocumentsReceived(event.target.checked)
                    }
                    className="h-5 w-5"
                  />

                  <div>
                    <p className="font-medium">Otra documentación</p>

                    <p className="text-xs text-white/40">
                      Documentación adicional entregada durante la visita.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* OBSERVACIÓN */}

            <div>
              <label className="mb-2 block text-sm font-medium text-white/70">
                Observación de la visita
              </label>

              <textarea
                value={visitObservation}
                disabled={loading}
                onChange={(event) => setVisitObservation(event.target.value)}
                rows={4}
                placeholder="Ej.: falta último recibo de sueldo, documentación ilegible, observaciones del domicilio..."
                className="w-full rounded-2xl border border-white/10 bg-[#0B1220] p-4 text-white outline-none focus:border-cyan-500/50"
              />

              <p className="mt-2 text-xs text-white/40">
                La observación es opcional cuando la visita se aprueba y
                obligatoria si se rechaza.
              </p>
            </div>

            {/* ACCIONES */}

            <div className="grid gap-3 sm:grid-cols-2">
              <DangerButton
                disabled={loading}
                onClick={() => setRejectVisitDialogOpen(true)}
                className="w-full"
              >
                Rechazar visita
              </DangerButton>

              <AddButton
                disabled={loading}
                onClick={() => setVisitDialogOpen(true)}
                className="w-full"
              >
                Aprobar visita
              </AddButton>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-white/60">
              No hay acciones de visita ambiental disponibles para el estado
              actual de la venta.
            </p>
          </div>
        )}
      </div>

      {/* ======================================================= */}
      {/* CONFIRMAR APROBACIÓN */}
      {/* ======================================================= */}

      <ConfirmDialog
        open={visitDialogOpen}
        onOpenChange={setVisitDialogOpen}
        title="¿Confirmar visita ambiental?"
        description="La venta avanzará a pendiente de entrega. Administración podrá coordinar con el cliente la fecha de entrega del producto."
        confirmText="Aprobar visita"
        cancelText="Cancelar"
        loading={loading}
        onConfirm={confirmVisit}
      />

      {/* ======================================================= */}
      {/* CONFIRMAR RECHAZO */}
      {/* ======================================================= */}

      <ConfirmDialog
        open={rejectVisitDialogOpen}
        onOpenChange={setRejectVisitDialogOpen}
        title="¿Rechazar visita ambiental?"
        description="La venta quedará rechazada por la visita ambiental. Debe existir una observación explicando el motivo."
        confirmText="Rechazar visita"
        cancelText="Cancelar"
        destructive
        loading={loading}
        onConfirm={rejectVisit}
      />
    </section>
  );
}
