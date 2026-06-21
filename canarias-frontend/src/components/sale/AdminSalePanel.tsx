"use client";

import { useState } from "react";
import { Sale } from "@/types/sales/sale.type";
import { adminValidateSale } from "@/services/sales.service";

export function AdminSalePanel({
  sale,
  onRefresh,
}: {
  sale: Sale;
  onRefresh: () => void | Promise<void>;
}) {
  const [obs, setObs] = useState("");
  const [loading, setLoading] = useState(false);

  const canValidate = sale.status === "PENDING_ADMIN_VALIDATION";

  const handle = async (status: "approved" | "rejected") => {
    if (!canValidate || loading) return;

    if (status === "rejected" && !obs.trim()) {
      alert("Debe ingresar observaciones para rechazar");
      return;
    }

    try {
      setLoading(true);

      await adminValidateSale(sale.saleId, status, obs);

      await Promise.resolve(onRefresh());

      setObs("");
    } catch (error) {
      console.error("Error validando venta:", error);
      alert("Error validando venta");
    } finally {
      setLoading(false);
    }
  };

  if (!canValidate) {
    return (
      <div className="rounded-2xl border border-gray-600/30 bg-gray-800/20 p-5 text-gray-400">
        Esta venta no está en estado de validación administrativa.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-5">
      <h3 className="mb-2 text-lg font-semibold text-white">
        Validación administrativa
      </h3>

      <p className="mb-4 text-sm text-gray-400">
        Esta venta está esperando aprobación para continuar al siguiente estado.
      </p>

      <textarea
        value={obs}
        onChange={(e) => setObs(e.target.value)}
        placeholder="Observaciones (obligatorio si rechaza)"
        disabled={loading}
        className="min-h-[100px] w-full rounded-xl border border-white/10 bg-[#0D1B2A] p-3 text-white disabled:opacity-50"
      />

      <div className="mt-4 flex gap-3">
        <button
          disabled={loading}
          onClick={() => handle("approved")}
          className="rounded-xl bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? "Procesando..." : "Aprobar y avanzar →"}
        </button>

        <button
          disabled={loading}
          onClick={() => handle("rejected")}
          className="rounded-xl bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50"
        >
          Rechazar
        </button>
      </div>
    </div>
  );
}
