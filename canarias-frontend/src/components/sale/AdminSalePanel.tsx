"use client";

import { useState } from "react";
import { Sale } from "@/types/sales/sale.type";
import { adminValidateSale } from "@/services/sales.service";

const ADMIN_VALIDATION_STATUS = "PENDING_ADMIN_VALIDATION" as const;

// 🔧 normalizador único y reutilizable
const normalizeStatus = (status?: string) => status?.trim().toUpperCase();

export function AdminSalePanel({
  sale,
  onRefresh,
}: {
  sale: Sale;
  onRefresh: () => void | Promise<void>;
}) {
  const [obs, setObs] = useState("");
  const [loading, setLoading] = useState(false);

  const saleStatus = normalizeStatus(sale?.status);

  const canValidate = saleStatus === ADMIN_VALIDATION_STATUS;

  const handle = async (status: "approved" | "rejected") => {
    if (!canValidate || loading) return;

    if (status === "rejected" && !obs.trim()) {
      alert("Debe ingresar observaciones para rechazar");
      return;
    }

    try {
      setLoading(true);

      await adminValidateSale(sale.saleId, status, obs);

      await onRefresh();
      setObs("");
    } catch (error) {
      console.error("Error validando venta:", error);
      alert("Error validando venta");
    } finally {
      setLoading(false);
    }
  };
  console.log("RAW STATUS:", sale.status);
  console.log("NORMALIZED:", saleStatus);
  console.log("EXPECTED:", ADMIN_VALIDATION_STATUS);

  return (
    <div
      className={`rounded-2xl border p-5 ${
        canValidate
          ? "border-yellow-500/20 bg-yellow-500/5"
          : "border-gray-600/30 bg-gray-800/20"
      }`}
    >
      <h3 className="mb-2 text-lg font-semibold text-white">
        Validación administrativa
      </h3>

      {/* Estado visible siempre */}
      {!canValidate && (
        <p className="mb-3 text-sm text-gray-400">
          Esta venta no está en estado de validación.
          <br />
          <span className="text-xs opacity-70">
            Status actual: {saleStatus ?? "undefined"}
          </span>
        </p>
      )}

      {canValidate && (
        <p className="mb-4 text-sm text-gray-400">
          Esta venta está esperando aprobación para continuar al siguiente
          estado.
        </p>
      )}

      <textarea
        value={obs}
        onChange={(e) => setObs(e.target.value)}
        placeholder="Observaciones (obligatorio si rechaza)"
        disabled={!canValidate || loading}
        className="min-h-[100px] w-full rounded-xl border border-white/10 bg-[#0D1B2A] p-3 text-white disabled:opacity-50"
      />

      <div className="mt-4 flex gap-3">
        <button
          disabled={!canValidate || loading}
          onClick={() => handle("approved")}
          className="rounded-xl bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? "Procesando..." : "Aprobar y avanzar →"}
        </button>

        <button
          disabled={!canValidate || loading}
          onClick={() => handle("rejected")}
          className="rounded-xl bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50"
        >
          Rechazar
        </button>
      </div>
    </div>
  );
}
