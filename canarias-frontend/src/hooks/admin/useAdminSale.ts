import { useMemo } from "react";
import { useSales } from "../sales/useSale";
import { Sale } from "@/types/sales/sale.type";
import { normalizeSaleStatus } from "@/types/sales/saleStatus.mapper";

export function useAdminDashboard() {
  const { sales } = useSales();

  return useMemo(() => {
    const list = sales ?? [];

    const stats = {
      pendingValidation: 0,
      pendingVisit: 0,
      pendingDelivery: 0,
      closed: 0,
      rejected: 0,
    };

    list.forEach((sale: Sale) => {
      const status = normalizeSaleStatus(sale.status);

      switch (status) {
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
