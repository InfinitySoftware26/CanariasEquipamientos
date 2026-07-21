"use client";

import { useEffect, useState } from "react";

import { getSaleHistory } from "@/services/sales.service";

import { SaleHistoryItem } from "@/types/sales/saleInformationCard";

import { getSaleStatusLabel } from "@/lib/sales/getSalesStatusLabel";

interface Props {
  saleId: string;
}

const HISTORY_LABELS: Record<string, string> = {
  SALE_CREATED: "Venta creada",

  ADMIN_APPROVED: "Validación administrativa aprobada",

  ADMIN_REJECTED: "Validación administrativa rechazada",

  ENV_VISIT_APPROVED: "Visita ambiental aprobada",

  ENV_VISIT_REJECTED: "Visita ambiental rechazada",

  COLLECTOR_REASSIGNED: "Cobrador asignado",

  DELIVERED: "Producto entregado",

  DELIVERY_FAILED: "Entrega fallida",

  SALE_CLOSED: "Venta cerrada",
};

const HISTORY_DESCRIPTIONS: Record<string, string> = {
  SALE_CREATED: "La venta fue registrada correctamente en el sistema.",

  ADMIN_APPROVED:
    "La venta pasó la validación administrativa y continúa al siguiente paso.",

  ADMIN_REJECTED: "La venta fue rechazada durante la revisión administrativa.",

  ENV_VISIT_APPROVED:
    "La visita ambiental fue aprobada y la venta continúa hacia la entrega.",

  ENV_VISIT_REJECTED: "La venta fue rechazada durante la visita ambiental.",

  COLLECTOR_REASSIGNED: "Se actualizó el cobrador responsable de la gestión.",

  DELIVERED: "El producto fue entregado al cliente.",

  DELIVERY_FAILED: "Se registró un intento de entrega fallido.",

  SALE_CLOSED: "La venta fue cerrada administrativamente.",
};

export function SaleHistoryCard({ saleId }: Props) {
  const [history, setHistory] = useState<SaleHistoryItem[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      try {
        setLoading(true);

        const data = await getSaleHistory(saleId);

        setHistory(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("ERROR HISTORY:", error);
      } finally {
        setLoading(false);
      }
    }

    void loadHistory();
  }, [saleId]);

  return (
    <section className="rounded-3xl border border-white/10 bg-[#111827] shadow-xl">
      <div className="border-b border-white/10 px-6 py-5">
        <h2 className="text-lg font-semibold text-white">
          Historial de la venta
        </h2>

        <p className="mt-1 text-sm text-white/50">
          Seguimiento del avance comercial.
        </p>
      </div>

      <div className="p-6">
        {loading && <p className="text-white/50">Cargando historial...</p>}

        {!loading && history.length === 0 && (
          <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center">
            <p className="text-white/40">No hay movimientos registrados.</p>
          </div>
        )}

        {!loading && history.length > 0 && (
          <div className="space-y-6">
            {history.map((item, index) => {
              const completed = index < history.length - 1;

              return (
                <div key={item.id} className="relative pl-10">
                  {index !== history.length - 1 && (
                    <div
                      className="
                              absolute
                              left-[9px]
                              top-5
                              h-full
                              w-px
                              bg-emerald-500/40
                            "
                    />
                  )}

                  <div
                    className={`
                          absolute
                          left-0
                          top-1
                          h-5
                          w-5
                          rounded-full
                          border-2

                          ${
                            completed
                              ? "border-emerald-500 bg-emerald-500"
                              : "border-[#F5A300] bg-[#F5A300]"
                          }
                        `}
                  />

                  <div className="rounded-2xl bg-[#0B1220] p-5">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <h3 className="font-semibold text-white">
                        {HISTORY_LABELS[item.action] ?? item.action}
                      </h3>

                      <span className="text-xs text-white/40">
                        {new Date(item.performedAt).toLocaleString("es-AR")}
                      </span>
                    </div>

                    <p className="mt-3 text-sm text-white/60">
                      {HISTORY_DESCRIPTIONS[item.action] ??
                        "Movimiento registrado."}
                    </p>

                    {item.snapshot.previousStatus && (
                      <p className="mt-4 text-sm text-white/70">
                        Estado anterior:
                        <span className="ml-2 text-white">
                          {
                            getSaleStatusLabel(item.snapshot.previousStatus)
                              .label
                          }
                        </span>
                      </p>
                    )}

                    {item.snapshot.newStatus && (
                      <p className="mt-2 text-sm text-white/70">
                        Nuevo estado:
                        <span className="ml-2 text-[#F5A300]">
                          {getSaleStatusLabel(item.snapshot.newStatus).label}
                        </span>
                      </p>
                    )}

                    {item.snapshot.observations && (
                      <div
                        className="
                                mt-4
                                rounded-xl
                                border
                                border-yellow-500/20
                                bg-yellow-500/10
                                p-3
                                text-sm
                                text-yellow-200
                              "
                      >
                        {item.snapshot.observations}
                      </div>
                    )}

                    <p className="mt-4 text-xs text-white/40">
                      Responsable: {item.performedByName}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
