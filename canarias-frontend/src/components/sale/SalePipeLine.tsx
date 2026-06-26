"use client";

import { Sale } from "@/types/sales/sale.type";

const steps: Sale["status"][] = [
  "pending_admin_validation",
  "pending_environmental_visit",
  "pending_delivery",
  "delivered",
  "closed",
];

const labels: Record<Sale["status"], string> = {
  pending_admin_validation: "Validación admin",
  pending_environmental_visit: "Visita ambiental",
  pending_delivery: "Entrega",
  delivered: "Entregado",
  closed: "Cerrado",
  rejected_admin: "Rechazado admin",
  environmental_rejected: "Rechazado técnico",
};

const colors: Record<Sale["status"], string> = {
  pending_admin_validation: "bg-yellow-500",
  pending_environmental_visit: "bg-blue-500",
  pending_delivery: "bg-purple-500",
  delivered: "bg-green-500",
  closed: "bg-gray-600",
  rejected_admin: "bg-red-500",
  environmental_rejected: "bg-red-600",
};
export function SalePipeline({ status }: { status: Sale["status"] }) {
  const currentIndex = steps.indexOf(status as (typeof steps)[number]);

  const isRejected =
    status === "rejected_admin" || status === "environmental_rejected";

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
      {/* REJECTED STATE */}
      {isRejected && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          Venta rechazada
        </div>
      )}

      {/* PIPELINE */}
      <div className="flex flex-wrap gap-3">
        {steps.map((step, index) => {
          const isDone = currentIndex !== -1 && index < currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <div
              key={step}
              className={`
                flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium
                transition-all
                ${
                  isDone
                    ? "bg-green-600 text-white"
                    : isCurrent
                      ? `${colors[step]} text-white ring-2 ring-white/20`
                      : "bg-white/10 text-gray-300"
                }
              `}
            >
              <span className="h-2 w-2 rounded-full bg-white/80" />
              {labels[step]}
            </div>
          );
        })}
      </div>
    </div>
  );
}
