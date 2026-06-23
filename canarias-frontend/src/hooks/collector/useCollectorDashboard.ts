"use client";

import { Sale } from "@/types/sales/sale.type";
import { useMemo } from "react";

export function useCollectorDashboard(sales: Sale[]) {
  return useMemo(() => {
    const stats = {
      pendingVisit: 0,
      pendingPayment: 0,
      pendingDelivery: 0,
      rejected: 0,
    };

    const alerts: string[] = [];

    for (const sale of sales) {
      switch (sale.status) {
        case "pending_environmental_visit":
          stats.pendingVisit++;
          stats.pendingPayment++;
          break;

        case "pending_delivery":
          stats.pendingDelivery++;
          break;

        case "environmental_rejected":
          stats.rejected++;
          break;
      }
    }

    if (stats.pendingVisit > 5) {
      alerts.push("Hay múltiples visitas pendientes de realizar.");
    }

    if (stats.pendingDelivery > 5) {
      alerts.push("Existen ventas aprobadas esperando preparación.");
    }

    return { stats, alerts };
  }, [sales]);
}
