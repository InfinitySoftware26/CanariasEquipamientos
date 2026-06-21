"use client";

import { useMemo } from "react";

import { Sale } from "@/types/sales/sale.type";
import { useSales } from "./useSale";

export function useAdminDashboard() {
  const { sales } = useSales();

  return useMemo(() => {
    const stats = {
      pendingValidation: 0,
      pendingVisit: 0,
      pendingDelivery: 0,
      closed: 0,
      rejected: 0,
    };

    sales.forEach((sale: Sale) => {
      switch (sale.status) {
        case "PENDING_ADMIN_VALIDATION":
          stats.pendingValidation++;
          break;

        case "PENDING_ENVIRONMENTAL_VISIT":
          stats.pendingVisit++;
          break;

        case "PENDING_DELIVERY":
          stats.pendingDelivery++;
          break;

        case "CLOSED":
          stats.closed++;
          break;

        case "REJECTED_ADMIN":
        case "ENVIRONMENTAL_REJECTED":
          stats.rejected++;
          break;
      }
    });

    return stats;
  }, [sales]);
}
