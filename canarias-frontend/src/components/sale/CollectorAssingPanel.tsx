"use client";

import { useEffect, useState } from "react";

import { Sale } from "@/types/sales/sale.type";
import { Collector } from "@/types/collector/collector.type";

import { getCollectors } from "@/services/collectors/collectors.services";
import { assignCollector } from "@/services/sales.service";

export function CollectorAssignPanel({
  sale,
  onRefresh,
}: {
  sale: Sale;
  onRefresh: () => void;
}) {
  const [collectors, setCollectors] = useState<Collector[]>([]);
  const [selected, setSelected] = useState(sale.assignedCollectorId ?? "");

  const [loading, setLoading] = useState(false);

  const loadCollectors = async () => {
    try {
      const data = await getCollectors();

      console.log("COLLECTORS:", data);

      setCollectors(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadCollectors();
  }, []);
  const handleAssign = async () => {
    if (!selected) {
      alert("Debe seleccionar un cobrador");
      return;
    }

    try {
      setLoading(true);

      await assignCollector(sale.saleId, selected);

      alert("Cobrador asignado");

      onRefresh();
    } catch (error) {
      console.error(error);
      alert("Error asignando cobrador");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <h3 className="mb-1 text-lg font-semibold text-white">
        Asignación de cobrador
      </h3>

      <p className="mb-3 text-sm text-gray-400">
        Se asigna después de la validación administrativa.
      </p>

      <select
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
        className="w-full rounded-xl border border-white/10 bg-[#0D1B2A] p-3 text-white"
      >
        <option value="">Seleccionar cobrador</option>

        {collectors.map((collector) => (
          <option key={collector.staffId} value={collector.staffId}>
            {collector.name}
          </option>
        ))}
      </select>

      <button
        onClick={handleAssign}
        disabled={loading}
        className="mt-4 rounded-xl bg-[#F5A300] px-4 py-2 font-semibold text-[#0D1B2A]"
      >
        {loading ? "Asignando..." : "Asignar cobrador"}
      </button>
    </div>
  );
}
