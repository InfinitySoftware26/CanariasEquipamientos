"use client";

import { Sale } from "@/types/sales/sale.type";

const steps: Extract<
  Sale["status"],
  | "PENDING_ADMIN_VALIDATION"
  | "PENDING_ENVIRONMENTAL_VISIT"
  | "PENDING_DELIVERY"
  | "DELIVERED"
  | "CLOSED"
>[] = [
  "PENDING_ADMIN_VALIDATION",
  "PENDING_ENVIRONMENTAL_VISIT",
  "PENDING_DELIVERY",
  "DELIVERED",
  "CLOSED",
];

const labels: Record<(typeof steps)[number], string> = {
  PENDING_ADMIN_VALIDATION: "Validación admin",
  PENDING_ENVIRONMENTAL_VISIT: "Visita técnica",
  PENDING_DELIVERY: "Entrega",
  DELIVERED: "Entregado",
  CLOSED: "Cerrado",
};

const colors: Record<(typeof steps)[number], string> = {
  PENDING_ADMIN_VALIDATION: "bg-yellow-500",
  PENDING_ENVIRONMENTAL_VISIT: "bg-blue-500",
  PENDING_DELIVERY: "bg-purple-500",
  DELIVERED: "bg-green-500",
  CLOSED: "bg-gray-600",
};

export function SalePipeline({ status }: { status: Sale["status"] }) {
  const currentIndex = steps.indexOf(status as (typeof steps)[number]);

  const isRejected =
    status === "REJECTED_ADMIN" || status === "ENVIRONMENTAL_REJECTED";

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
