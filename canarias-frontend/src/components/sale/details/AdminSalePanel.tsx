"use client";

import { useEffect, useState } from "react";

import { Sale } from "@/types/sales/sale.type";
import { Collector } from "@/types/collector/collector.type";

import {
  adminValidateSale,
  assignCollector,
  closeSale,
  deliverSale,
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

      await closeSale(sale.saleId);

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
          <div className="flex gap-3">
            <button
              onClick={() => validate("rejected")}
              className="rounded-xl bg-red-500/20 px-5 py-2 text-red-300"
            >
              Rechazar
            </button>

            <button
              onClick={() => validate("approved")}
              className="rounded-xl bg-[#F5A300] px-5 py-2 text-black"
            >
              Aprobar
            </button>
          </div>
        )}

        {canAssign && (
          <div className="space-y-3">
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
              onClick={handleAssign}
              className="w-full rounded-xl bg-[#F5A300] py-3 text-black"
            >
              Asignar cobrador
            </button>
          </div>
        )}

        {canDelivery && (
          <button
            onClick={handleDelivery}
            className="w-full rounded-xl bg-[#F5A300] py-3 text-black"
          >
            Enviar a entrega
          </button>
        )}

        {canClose && (
          <button
            onClick={handleClose}
            className="w-full rounded-xl bg-emerald-500 py-3 text-black"
          >
            Cerrar venta
          </button>
        )}
      </div>
    </section>
  );
}
