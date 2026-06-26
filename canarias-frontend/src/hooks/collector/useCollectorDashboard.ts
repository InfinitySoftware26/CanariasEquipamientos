"use client";

import { Sale } from "@/types/sales/sale.type";
import { useMemo } from "react";

export function useCollectorDashboard(sales: Sale[]) {
  return useMemo(() => {
    const stats = {
      pendingVisit: 0,
      pendingDelivery: 0,
      rejected: 0,
    };

    const alerts: string[] = [];

    for (const sale of sales) {
      switch (sale.status) {
        case "pending_environmental_visit":
          stats.pendingVisit++;
          break;

        case "pending_delivery":
          stats.pendingDelivery++;
          break;

        case "environmental_rejected":
          stats.rejected++;
          break;
      }
    }

    // 🔥 ALERTAS REALES (sin umbral absurdo)
    if (stats.pendingVisit > 0) {
      alerts.push(`${stats.pendingVisit} visitas pendientes de realizar`);
    }

    if (stats.pendingDelivery > 0) {
      alerts.push(`${stats.pendingDelivery} entregas pendientes`);
    }

    if (stats.rejected > 0) {
      alerts.push(`${stats.rejected} operaciones rechazadas`);
    }

    return { stats, alerts };
  }, [sales]);
}
