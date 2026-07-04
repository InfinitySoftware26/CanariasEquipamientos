"use client";

import { useState } from "react";

import { Sale } from "@/types/sales/sale.type";

import {
  adminValidateSale,
  updateSaleObservation,
  deliverSale,
} from "@/services/sales.service";

import { getSaleStatusLabel } from "@/lib/sales/getSalesStatusLabel";

interface Props {
  sale: Sale;
  onRefresh: () => void | Promise<void>;
}

const normalize = (status?: string) => status?.trim().toUpperCase() ?? "";

export function AdminSalePanel({ sale, onRefresh }: Props) {
  const [loading, setLoading] = useState(false);
  const [observation, setObservation] = useState(sale.observation ?? "");

  const status = normalize(sale.status);
  const statusLabel = getSaleStatusLabel(status);

  const canValidate = status === "PENDING_ADMIN_VALIDATION";
  const canSendToDelivery = status === "PENDING_DELIVERY";

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
    if (loading) return;

    if (result === "rejected" && observation.trim().length === 0) {
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

  async function handleSendToDelivery() {
    try {
      setLoading(true);

      await deliverSale(sale.saleId);

      await onRefresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-3xl border border-white/10 bg-[#111827] shadow-xl">
      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
        <div>
          <h2 className="text-lg font-semibold text-white">
            Validación administrativa
          </h2>

          <p className="mt-1 text-sm text-white/50">
            Revisá la documentación comercial de la venta.
          </p>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-sm font-semibold ${statusLabel.className}`}
        >
          {statusLabel.label}
        </span>
      </div>

      {/* CONTENT */}
      <div className="space-y-6 p-6">
        {/* SUMMARY */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-[#0B1220] p-4">
            <p className="text-xs text-white/40">Cliente</p>
            <p className="mt-1 text-white font-medium">
              {sale.client?.name} {sale.client?.surname}
            </p>
          </div>

          <div className="rounded-2xl bg-[#0B1220] p-4">
            <p className="text-xs text-white/40">Total</p>
            <p className="mt-1 text-white font-medium">
              ${sale.totalAmount?.toLocaleString("es-AR")}
            </p>
          </div>
        </div>

        {/* OBSERVATION */}
        <div>
          <label className="mb-2 block text-sm text-white/70">
            Observaciones
          </label>

          <textarea
            value={observation}
            onChange={(e) => setObservation(e.target.value)}
            rows={6}
            className="w-full rounded-2xl border border-white/10 bg-[#0B1220] p-4 text-white outline-none focus:border-[#F5A300]"
          />
        </div>

        {/* ACTIONS */}
        <div className="flex flex-wrap justify-between gap-3">
          <button
            disabled={loading}
            onClick={saveObservation}
            className="rounded-2xl border border-white/10 px-5 py-2 text-white hover:bg-white/5"
          >
            Guardar observación
          </button>

          {canValidate && (
            <div className="flex gap-3">
              <button
                disabled={loading}
                onClick={() => validate("rejected")}
                className="rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-2 text-red-300"
              >
                Rechazar
              </button>

              <button
                disabled={loading}
                onClick={() => validate("approved")}
                className="rounded-2xl bg-[#F5A300] px-5 py-2 font-semibold text-[#081120]"
              >
                Aprobar
              </button>
            </div>
          )}
        </div>

        {/* DELIVERY ACTION */}
        {canSendToDelivery && (
          <div className="rounded-2xl border border-[#F5A300]/20 bg-[#F5A300]/10 p-4">
            <p className="text-[#F5A300] font-medium">
              Producto listo para envío
            </p>

            <button
              disabled={loading}
              onClick={handleSendToDelivery}
              className="mt-4 w-full rounded-2xl bg-[#F5A300] px-5 py-3 font-semibold text-[#081120]"
            >
              Marcar como en delivery
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
