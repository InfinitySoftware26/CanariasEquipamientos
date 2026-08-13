"use client";

import { useMemo } from "react";
import { Sale } from "@/types/sales/sale.type";

export interface CollectorDashboardStats {
  pendingVisit: number;
  pendingDelivery: number;
  rejected: number;
  assigned: number;

  // Sprint 4
  collectedToday: number;
  failedVisits: number;
  dailyClosure: boolean;
  routeAssigned: boolean;
}

export function useCollectorDashboard(sales: Sale[]) {
  return useMemo(() => {
    const stats: CollectorDashboardStats = {
      pendingVisit: 0,
      pendingDelivery: 0,
      rejected: 0,

      assigned: sales.length,

      // estos valores luego vendrán de Payments,
      // Failed Visits y Daily Closures
      collectedToday: 0,
      failedVisits: 0,
      dailyClosure: false,
      routeAssigned: sales.length > 0,
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

    if (stats.pendingVisit > 0) {
      alerts.push(`${stats.pendingVisit} visitas ambientales pendientes.`);
    }

    if (stats.pendingDelivery > 0) {
      alerts.push(`${stats.pendingDelivery} entregas pendientes.`);
    }

    if (stats.rejected > 0) {
      alerts.push(`${stats.rejected} operaciones rechazadas.`);
    }

    if (!stats.routeAssigned) {
      alerts.push("No posee hoja de ruta asignada.");
    }

    if (!stats.dailyClosure) {
      alerts.push("Todavía no realizó el cierre diario.");
    }

    return {
      stats,
      alerts,
    };
  }, [sales]);
}
