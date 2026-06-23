import { useMemo } from "react";
import { useSellerSales } from "./useSellerSale";

const normalize = (status: string) => status?.toLowerCase();

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
      const status = normalize(sale.status);

      switch (status) {
        case "pending_admin_validation":
          pipeline.adminValidation++;
          break;

        case "pending_environmental_visit":
          pipeline.envVisit++;
          break;

        case "pending_delivery":
          pipeline.delivery++;
          break;

        case "closed":
          pipeline.closed++;
          break;

        case "rejected_admin":
        case "environmental_rejected":
          pipeline.rejected++;
          break;
      }
    }

    if (pipeline.adminValidation > 5) {
      alerts.push("Muchas ventas están trabadas en validación administrativa");
    }

    if (pipeline.delivery > 3) {
      alerts.push("Backlog en entregas pendiente");
    }

    return {
      pipeline,
      alerts,
      total: sales.length,
    };
  }, [sales]);
}
