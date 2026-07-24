"use client";

import { CheckCircle2, Clock3, XCircle } from "lucide-react";

import { Sale } from "@/types/sales/sale.type";

interface Props {
  status: Sale["status"];
}

const STEPS = [
  {
    key: "pending_admin_validation",
    title: "Validación",
    description: "Revisión administrativa",
  },
  {
    key: "pending_environmental_visit",
    title: "Visita",
    description: "Validación ambiental",
  },
  {
    key: "pending_delivery",
    title: "Entrega",
    description: "Preparación de entrega",
  },
  {
    key: "delivered",
    title: "Entregado",
    description: "Producto entregado",
  },
  {
    key: "closed",
    title: "Cerrado",
    description: "Venta finalizada",
  },
] as const;

const rejectedStates = ["rejected_admin", "environmental_rejected"];

export function SalePipeline({ status }: Props) {
  const currentIndex = STEPS.findIndex((s) => s.key === status);

  const rejected = rejectedStates.includes(status);

  return (
    <section className="rounded-3xl border border-white/10 bg-[#111827] shadow-xl">
      <div className="border-b border-white/10 px-6 py-5">
        <h2 className="text-lg font-semibold text-white">Estado de la venta</h2>

        <p className="mt-1 text-sm text-white/50">
          Seguimiento del flujo comercial.
        </p>
      </div>

      <div className="overflow-x-auto">
        <div className="flex justify-center py-8">
          <div className="flex min-w-[920px] items-center px-8">
            {STEPS.map((step, index) => {
              const completed = !rejected && currentIndex > index;
              const current = !rejected && currentIndex === index;

              return (
                <div key={step.key} className="flex items-center">
                  <div className="flex w-[150px] shrink-0 flex-col items-center text-center">
                    <div
                      className={`
                        flex h-14 w-14 items-center justify-center rounded-full border-2 transition-all

                        ${
                          completed
                            ? "border-emerald-500 bg-emerald-500 text-white"
                            : current
                              ? "border-[#F5A300] bg-[#F5A300] text-black"
                              : rejected
                                ? "border-red-500 bg-red-500 text-white"
                                : "border-white/20 bg-[#0B1220] text-white/40"
                        }
                      `}
                    >
                      {rejected ? (
                        <XCircle size={22} />
                      ) : completed ? (
                        <CheckCircle2 size={22} />
                      ) : current ? (
                        <Clock3 size={22} />
                      ) : (
                        index + 1
                      )}
                    </div>

                    <h3 className="mt-4 text-sm font-semibold text-white">
                      {step.title}
                    </h3>

                    <p className="mt-1 text-xs text-white/40">
                      {step.description}
                    </p>
                  </div>

                  {index < STEPS.length - 1 && (
                    <div
                      className={`
                        mx-2 h-[2px] w-20

                        ${completed ? "bg-emerald-500" : "bg-white/10"}
                      `}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {rejected && (
        <div className="border-t border-red-500/20 bg-red-500/10 px-6 py-4">
          <p className="font-medium text-red-300">
            La venta fue rechazada y el flujo se detuvo.
          </p>
        </div>
      )}
    </section>
  );
}
