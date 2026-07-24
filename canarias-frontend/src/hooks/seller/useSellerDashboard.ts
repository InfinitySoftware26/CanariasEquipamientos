import { useMemo } from "react";
import { useSellerSales } from "./useSellerSale";

const normalize = (status: string) => status?.toLowerCase();

export function useSellerDashboard() {
  const { sales, loading, error } = useSellerSales();

  return useMemo(() => {
    const pipeline = {
      validation: 0,
      visit: 0,
      delivery: 0,
      closed: 0,
      rejected: 0,
    };

    const now = new Date();

    let monthlyCommission = 0;

    for (const sale of sales) {
      const status = normalize(sale.status);

      switch (status) {
        case "pending_admin_validation":
          pipeline.validation++;
          break;

        case "pending_environmental_visit":
          pipeline.visit++;
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

      // Comisión mensual del vendedor
      const saleDate = new Date(sale.saleDate);

      const isCurrentMonth =
        saleDate.getMonth() === now.getMonth() &&
        saleDate.getFullYear() === now.getFullYear();

      if (status === "closed" && isCurrentMonth) {
        monthlyCommission += Number(sale.sellerCommission ?? 0);
      }
    }

    const alerts: string[] = [];

    if (pipeline.validation > 5) {
      alerts.push("Tenés varias ventas esperando validación");
    }

    if (pipeline.delivery > 3) {
      alerts.push("Hay entregas pendientes de seguimiento");
    }

    return {
      kpis: {
        salesToday: sales.length,

        approvedSales: pipeline.closed,

        pendingClients: pipeline.validation + pipeline.visit,

        monthlyCommission,
      },

      pipeline,

      alerts,

      loading,

      error,
    };
  }, [sales, loading, error]);
}
