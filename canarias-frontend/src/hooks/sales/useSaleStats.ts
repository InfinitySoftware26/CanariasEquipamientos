// hooks/sales/useSalesStats.ts
import { useEffect, useState } from "react";
import { getSales } from "@/services/sales.service";
import { Sale } from "@/types/sales/sale.type";

export function useSalesStats() {
  const [stats, setStats] = useState({
    pendingValidation: 0,
    pendingVisit: 0,
    pendingDelivery: 0,
    closed: 0,
    rejected: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const sales: Sale[] = await getSales();

        const next = {
          pendingValidation: 0,
          pendingVisit: 0,
          pendingDelivery: 0,
          closed: 0,
          rejected: 0,
        };

        for (const sale of sales) {
          switch (sale.status) {
            case "PENDING_ADMIN_VALIDATION":
              next.pendingValidation++;
              break;

            case "PENDING_ENVIRONMENTAL_VISIT":
              next.pendingVisit++;
              break;

            case "PENDING_DELIVERY":
              next.pendingDelivery++;
              break;

            case "CLOSED":
              next.closed++;
              break;

            case "REJECTED_ADMIN":
            case "ENVIRONMENTAL_REJECTED":
              next.rejected++;
              break;
          }
        }

        setStats(next);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return { stats, loading };
}
