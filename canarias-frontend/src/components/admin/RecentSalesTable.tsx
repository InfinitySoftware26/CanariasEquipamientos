"use client";

import { Sale } from "@/types/sales/sale.type";
import { normalizeSaleStatus } from "@/types/sales/saleStatus.mapper";

interface RecentSalesTableProps {
  sales: Sale[];
}

export function RecentSalesTable({ sales }: RecentSalesTableProps) {
  const getBadge = (status: string) => {
    switch (normalizeSaleStatus(status)) {
      case "PENDING_ADMIN_VALIDATION":
        return "bg-amber-500/20 text-amber-300";

      case "PENDING_ENVIRONMENTAL_VISIT":
        return "bg-blue-500/20 text-blue-300";

      case "PENDING_DELIVERY":
        return "bg-cyan-500/20 text-cyan-300";

      case "DELIVERED":
        return "bg-indigo-500/20 text-indigo-300";

      case "CLOSED":
        return "bg-green-500/20 text-green-300";

      case "REJECTED_ADMIN":
      case "ENVIRONMENTAL_REJECTED":
        return "bg-red-500/20 text-red-300";

      default:
        return "bg-white/10";
    }
  };

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <h2 className="mb-6 text-lg font-semibold text-white">Últimas ventas</h2>

      <div className="space-y-4">
        {sales.map((sale) => (
          <div
            key={sale.saleId}
            className="flex items-center justify-between rounded-xl border border-white/10 p-4"
          >
            <div>
              <p className="font-medium text-white">
                {sale.client?.name} {sale.client?.surname}
              </p>

              <p className="text-sm text-white/50">
                {new Date(sale.saleDate).toLocaleDateString("es-AR")}
              </p>
            </div>

            <div className="text-right">
              <p className="font-semibold text-white">
                ${Number(sale.totalAmount).toLocaleString("es-AR")}
              </p>

              <span
                className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-medium ${getBadge(
                  sale.status,
                )}`}
              >
                {normalizeSaleStatus(sale.status)
                  .replaceAll("_", " ")
                  .toLowerCase()}
              </span>
            </div>
          </div>
        ))}

        {sales.length === 0 && (
          <p className="text-sm text-white/50">No hay ventas registradas.</p>
        )}
      </div>
    </section>
  );
}
