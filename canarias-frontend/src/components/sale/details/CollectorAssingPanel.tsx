"use client";

import { useState } from "react";

import { Sale } from "@/types/sales/sale.type";

import {
  deliverSale,
  validateEnvironmentalVisit,
} from "@/services/sales.service";

import { getSaleStatusLabel } from "@/lib/sales/getSalesStatusLabel";

import { SaleStatusBadge } from "../SalesStatusBadge";

interface Props {
  sale: Sale;

  onRefresh: () => void | Promise<void>;
}

export function CollectorSalePanel({ sale, onRefresh }: Props) {
  const [loading, setLoading] = useState(false);

  const badge = getSaleStatusLabel(sale.status);

  async function confirmVisit() {
    try {
      setLoading(true);

      await validateEnvironmentalVisit(sale.saleId, "approved");

      await onRefresh();
    } finally {
      setLoading(false);
    }
  }

  async function confirmDelivery() {
    try {
      setLoading(true);

      await deliverSale(sale.saleId);

      await onRefresh();
    } finally {
      setLoading(false);
    }
  }

  const canVisit = sale.status === "pending_environmental_visit";

  const canDeliver = sale.status === "pending_delivery";

  return (
    <section className="rounded-3xl border border-white/10 bg-[#111827] shadow-xl">
      <div className="flex justify-between border-b border-white/10 px-6 py-5">
        <h2 className="font-semibold text-white">Gestión del cobrador</h2>

        <SaleStatusBadge {...badge} />
      </div>

      <div className="p-6">
        {canVisit && (
          <button
            disabled={loading}
            onClick={confirmVisit}
            className="w-full rounded-xl bg-[#F5A300] py-3 text-black"
          >
            Confirmar visita ambiental
          </button>
        )}

        {canDeliver && (
          <button
            disabled={loading}
            onClick={confirmDelivery}
            className="w-full rounded-xl bg-emerald-500 py-3 text-black"
          >
            Confirmar entrega
          </button>
        )}
      </div>
    </section>
  );
}
