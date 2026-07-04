"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Sale } from "@/types/sales/sale.type";
import { Collector } from "@/types/collector/collector.type";

import { getCollectors } from "@/services/collectors/collectors.services";

import { assignCollector, closeSale } from "@/services/sales.service";

export function CollectorAssignPanel({
  sale,
  onRefresh,
}: {
  sale: Sale;
  onRefresh: () => void | Promise<void>;
}) {
  const router = useRouter();

  const [collectors, setCollectors] = useState<Collector[]>([]);
  const [selected, setSelected] = useState(sale.assignedCollectorId ?? "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadCollectors = async () => {
      try {
        const data = await getCollectors();
        setCollectors(data);
      } catch (error) {
        console.error(error);
      }
    };

    loadCollectors();
  }, []);

  async function handleAssign() {
    if (!selected) {
      alert("Debe seleccionar un cobrador");
      return;
    }

    try {
      setLoading(true);

      await assignCollector(sale.saleId, selected);
      await onRefresh();

      router.push("/sales");
    } finally {
      setLoading(false);
    }
  }

  async function handleCloseSale() {
    try {
      setLoading(true);

      await closeSale(sale.saleId);

      await onRefresh();

      router.push("/sales");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-3xl border border-white/10 bg-[#111827] shadow-xl">
      {/* HEADER */}
      <div className="border-b border-white/10 px-6 py-5">
        <h2 className="text-lg font-semibold text-white">
          Asignación de cobrador
        </h2>

        <p className="mt-1 text-sm text-white/50">
          Seleccioná el responsable del cobro.
        </p>
      </div>

      {/* CONTENT */}
      <div className="space-y-6 p-6">
        {/* SELECT */}
        <div>
          <label className="mb-2 block text-sm text-white/70">Cobrador</label>

          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-[#0B1220] px-4 py-3 text-white"
          >
            <option value="">Seleccionar...</option>

            {collectors.map((c) => (
              <option key={c.staffId} value={c.staffId}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* ASSIGN */}
        <button
          disabled={loading}
          onClick={handleAssign}
          className="w-full rounded-2xl bg-[#F5A300] px-6 py-3 font-semibold text-[#081120]"
        >
          Asignar cobrador
        </button>

        {/* FINAL FLOW */}
        {sale.status === "delivered" && (
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
            <p className="text-emerald-300 font-medium">Producto en entrega</p>

            <button
              disabled={loading}
              onClick={handleCloseSale}
              className="mt-4 w-full rounded-2xl bg-emerald-400 px-5 py-3 font-semibold text-black"
            >
              Marcar como entregado y cerrar venta
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
