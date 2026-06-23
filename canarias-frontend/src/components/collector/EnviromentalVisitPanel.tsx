"use client";

import { useState } from "react";

import { Sale } from "@/types/sales/sale.type";
import { envValidateSale } from "@/services/collectors/collectors.services";

const VISIT_STATUS = "pending_environmental_visit" as const;

export function EnvironmentalVisitPanel({
  sale,
  onRefresh,
}: {
  sale: Sale;
  onRefresh: () => void | Promise<void>;
}) {
  const [obs, setObs] = useState("");

  const [loading, setLoading] = useState(false);

  const canValidate = sale.status === VISIT_STATUS;

  async function handle(status: "approved" | "rejected") {
    if (!canValidate || loading) return;

    if (status === "rejected" && !obs.trim()) {
      alert("Debe indicar motivo de rechazo");

      return;
    }

    try {
      setLoading(true);

      await envValidateSale(sale.saleId, status, obs);

      await onRefresh();

      setObs("");
    } catch (error) {
      console.error(error);

      alert("Error procesando visita");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <h3 className="mb-2 text-lg font-semibold text-white">
        Visita ambiental
      </h3>

      {!canValidate && (
        <p className="text-sm text-gray-400">Esta venta ya fue procesada.</p>
      )}

      {canValidate && (
        <>
          <p className="mb-4 text-sm text-gray-400">
            Verifique domicilio, documentación y condiciones del cliente.
          </p>

          <textarea
            value={obs}
            onChange={(e) => setObs(e.target.value)}
            placeholder="Observaciones"
            className="min-h-[100px] w-full rounded-xl border border-white/10 bg-[#0D1B2A] p-3 text-white"
          />

          <div className="mt-4 flex gap-3">
            <button
              disabled={loading}
              onClick={() => handle("approved")}
              className="rounded-xl bg-green-600 px-4 py-2 text-white"
            >
              Aprobar visita
            </button>

            <button
              disabled={loading}
              onClick={() => handle("rejected")}
              className="rounded-xl bg-red-600 px-4 py-2 text-white"
            >
              Rechazar visita
            </button>
          </div>
        </>
      )}
    </div>
  );
}
