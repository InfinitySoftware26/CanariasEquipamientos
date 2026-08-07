"use client";

import { useEffect, useState } from "react";

import { Sale } from "@/types/sales/sale.type";
import { Collector } from "@/types/collector/collector.type";

import {
  adminValidateSale,
  assignCollector,
  closeSale,
  deliverSale,
  scheduleDeliveryDate,
  updateSaleObservation,
} from "@/services/sales.service";

import { getCollectors } from "@/services/collectors/collectors.services";

import { getSaleStatusLabel } from "@/lib/sales/getSalesStatusLabel";

import { SaleStatusBadge } from "../SalesStatusBadge";

interface Props {
  sale: Sale;
  onRefresh: () => void | Promise<void>;
}

export function AdminSalePanel({ sale, onRefresh }: Props) {
  const [loading, setLoading] = useState(false);

  const [observation, setObservation] = useState(sale.observation ?? "");

  const [collectors, setCollectors] = useState<Collector[]>([]);

  const [selectedCollector, setSelectedCollector] = useState(
    sale.assignedCollectorId ?? "",
  );

  const [deliveryDate, setDeliveryDate] = useState(
    sale.deliveryDate?.split("T")[0] ?? "",
  );
  console.log("deliveryDate", deliveryDate);

  const badge = getSaleStatusLabel(sale.status);

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

  const canValidate = sale.status === "pending_admin_validation";

  const canAssign = sale.status === "pending_environmental_visit";

  const canDelivery = sale.status === "pending_delivery";

  const canClose = sale.status === "delivered";

  async function saveObservation() {
    try {
      setLoading(true);

      await updateSaleObservation(sale.saleId, observation);

      await onRefresh();
    } finally {
      setLoading(false);
    }
  }

  async function validate(result: "approved" | "rejected") {
    if (result === "rejected" && !observation.trim()) {
      alert("Debe ingresar una observación para rechazar.");

      return;
    }

    try {
      setLoading(true);

      await adminValidateSale(sale.saleId, result, observation);

      await onRefresh();
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
    } finally {
      setLoading(false);
    }
  }

  async function scheduleDelivery() {
    if (!deliveryDate) {
      alert("Seleccione una fecha de entrega.");

      return;
    }

    try {
      setLoading(true);

      await scheduleDeliveryDate(sale.saleId, deliveryDate);

      await onRefresh();
    } finally {
      setLoading(false);
    }
  }

  async function handleDelivery() {
    try {
      setLoading(true);

      await deliverSale(sale.saleId);

      await onRefresh();
    } finally {
      setLoading(false);
    }
  }

  async function handleClose() {
    try {
      setLoading(true);

      if (deliveryDate) {
        await scheduleDeliveryDate(sale.saleId, deliveryDate);
      }

      await closeSale(sale.saleId, deliveryDate);

      await onRefresh();
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
              continúa o debe rechazarse.
            </p>
          )}

          {sale.status === "pending_environmental_visit" && (
            <p className="mt-2 text-white/80">
              La venta fue aprobada administrativamente. Ahora asigná el
              cobrador responsable para realizar la visita ambiental.
            </p>
          )}

          {sale.status === "pending_delivery" && (
            <p className="mt-2 text-white/80">
              La visita ambiental ya fue aprobada. Esperando que el cobrador
              confirme la entrega.
            </p>
          )}

          {sale.status === "delivered" && (
            <p className="mt-2 text-white/80">
              El cobrador confirmó la entrega. Sólo resta cerrar
              administrativamente la venta.
            </p>
          )}

          {sale.status === "closed" && (
            <p className="mt-2 text-emerald-300">
              Esta venta ya fue finalizada.
            </p>
          )}
        </div>

        <textarea
          value={observation}
          onChange={(e) => setObservation(e.target.value)}
          rows={4}
          placeholder="Observaciones..."
          className="w-full rounded-2xl bg-[#0B1220] p-4 text-white"
        />

        <button
          disabled={loading}
          onClick={saveObservation}
          className="rounded-xl border border-white/10 px-5 py-2 text-white"
        >
          Guardar observación
        </button>

        {canValidate && (
          <div className="space-y-3 rounded-2xl border border-white/10 p-5">
            <h3 className="font-semibold text-white">
              Paso 1 · Validación administrativa
            </h3>

            <p className="text-sm text-white/60">
              Si la información es correcta aprobá la venta. Si detectás
              inconsistencias rechazala indicando una observación.
            </p>

            <div className="flex gap-3">
              <button
                disabled={loading}
                onClick={() => validate("rejected")}
                className="rounded-xl bg-red-500/20 px-5 py-2 text-red-300"
              >
                Rechazar venta
              </button>

              <button
                disabled={loading}
                onClick={() => validate("approved")}
                className="rounded-xl bg-[#F5A300] px-5 py-2 font-semibold text-black"
              >
                Aprobar venta
              </button>
            </div>
          </div>
        )}

        {canAssign && (
          <div className="space-y-4 rounded-2xl border border-white/10 p-5">
            <h3 className="font-semibold text-white">
              Paso 2 · Asignar cobrador
            </h3>

            <p className="text-sm text-white/60">
              Seleccioná quién realizará la visita ambiental y la entrega.
            </p>

            <select
              value={selectedCollector}
              onChange={(e) => setSelectedCollector(e.target.value)}
              className="w-full rounded-xl bg-[#0B1220] p-3 text-white"
            >
              <option value="">Seleccionar cobrador</option>

              {collectors.map((c) => (
                <option key={c.staffId} value={c.staffId}>
                  {c.name}
                </option>
              ))}
            </select>

            <button
              disabled={loading}
              onClick={handleAssign}
              className="w-full rounded-xl bg-[#F5A300] py-3 font-semibold text-black"
            >
              Asignar cobrador
            </button>
          </div>
        )}

        {canDelivery && (
          <div className="space-y-4 rounded-2xl border border-blue-500/20 bg-blue-500/10 p-5">
            <h3 className="font-semibold text-blue-300">Coordinar entrega</h3>

            <p className="text-sm text-white/70">
              Seleccione la fecha y hora acordada con el cliente para realizar
              la entrega.
            </p>

            <input
              type="date"
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
              className="w-full rounded-xl bg-[#0B1220] p-3 text-white"
            />

            <button
              disabled={loading}
              onClick={scheduleDelivery}
              className="w-full rounded-xl bg-[#F5A300] py-3 font-semibold text-black"
            >
              Guardar coordinación
            </button>
          </div>
        )}

        {canClose && (
          <div className="space-y-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5">
            <h3 className="font-semibold text-emerald-300">
              Cierre administrativo
            </h3>

            <p className="text-sm text-white/70">
              El cobrador confirmó la entrega. Si fue necesario, podés modificar
              la fecha de entrega antes de cerrar definitivamente la venta.
            </p>

            <input
              type="date"
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
              className="w-full rounded-xl bg-[#0B1220] p-3 text-white"
            />

            <button
              disabled={loading}
              onClick={scheduleDelivery}
              className="w-full rounded-xl border border-[#F5A300] py-3 font-semibold text-[#F5A300] hover:bg-[#F5A300]/10"
            >
              Actualizar fecha de entrega
            </button>

            <button
              disabled={loading}
              onClick={handleClose}
              className="w-full rounded-xl bg-[#F5A300] py-3 font-semibold text-black hover:bg-[#ffb82c]"
            >
              Cerrar venta
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
