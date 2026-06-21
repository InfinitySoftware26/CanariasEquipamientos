import { useMemo } from "react";
import { useSellerSales } from "./useSellerSale";
import { Pipeline, Sale } from "@/types/sales/sale.type";

export function useSellerDashboard() {
  const { sales } = useSellerSales();

  return useMemo(() => {
    const pipeline = {
      adminValidation: 0,
      envVisit: 0,
      delivery: 0,
      closed: 0,
      rejected: 0,
    };

    const alerts: string[] = [];

    for (const sale of sales) {
      if (sale.status === "PENDING_ADMIN_VALIDATION")
        pipeline.adminValidation++;
      if (sale.status === "PENDING_ENVIRONMENTAL_VISIT") pipeline.envVisit++;
      if (sale.status === "PENDING_DELIVERY") pipeline.delivery++;
      if (sale.status === "CLOSED") pipeline.closed++;

      if (
        sale.status === "REJECTED_ADMIN" ||
        sale.status === "ENVIRONMENTAL_REJECTED"
      ) {
        pipeline.rejected++;
      }
    }

    if (pipeline.adminValidation > 5) {
      alerts.push("Muchas ventas están trabadas en validación administrativa");
    }

    if (pipeline.delivery > 3) {
      alerts.push("Backlog en entregas pendiente");
    }

    return { pipeline, alerts, total: sales.length };
  }, [sales]);
}
