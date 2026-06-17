import { useEffect, useState } from "react";
import { getMySales } from "@/services/sales.service";
import { Sale } from "@/types/sale.type";

export function useSellerDashboard() {
  const [data, setData] = useState({
    totalSales: 0,
    pendingAdminValidation: 0,
    pendingEnvironmentalVisit: 0,
    pendingDelivery: 0,
    closedSales: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const response = await getMySales();

        const sales: Sale[] = Array.isArray(response)
          ? response
          : (response.data ?? []);

        setData({
          totalSales: sales.length,

          pendingAdminValidation: sales.filter(
            (sale) => sale.status === "PENDING_ADMIN_VALIDATION",
          ).length,

          pendingEnvironmentalVisit: sales.filter(
            (sale) => sale.status === "PENDING_ENVIRONMENTAL_VISIT",
          ).length,

          pendingDelivery: sales.filter(
            (sale) => sale.status === "PENDING_DELIVERY",
          ).length,

          closedSales: sales.filter((sale) => sale.status === "CLOSED").length,
        });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return { data, loading };
}
