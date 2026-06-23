import { Sale } from "@/types/sales/sale.type";
import { useMemo } from "react";

export function useCollectorDeliveries(sales: Sale[]) {
  return useMemo(() => {
    const pendingDelivery = sales.filter(
      (s) => s.status === "pending_delivery",
    );

    const delivered = sales.filter((s) => s.status === "delivered");

    return {
      pendingDelivery,
      delivered,
    };
  }, [sales]);
}
