import { Sale } from "@/types/sales/sale.type";
import { useMemo, useState } from "react";

type FilterType = "ALL" | "PENDING" | "CLOSED";

const PENDING_STATUSES = [
  "PENDING_ADMIN_VALIDATION",
  "PENDING_ENVIRONMENTAL_VISIT",
  "PENDING_DELIVERY",
];

export function useSalesView(sales: Sale[]) {
  const [filter, setFilter] = useState<FilterType>("ALL");

  const filteredSales = useMemo(() => {
    if (filter === "ALL") return sales;

    if (filter === "PENDING") {
      return sales.filter((s) => PENDING_STATUSES.includes(s.status));
    }

    return sales.filter((s) => s.status === "CLOSED");
  }, [sales, filter]);

  const stats = useMemo(
    () => ({
      total: sales.length,
      adminValidation: sales.filter(
        (s) => s.status === "PENDING_ADMIN_VALIDATION",
      ).length,
      envVisit: sales.filter((s) => s.status === "PENDING_ENVIRONMENTAL_VISIT")
        .length,
      delivery: sales.filter((s) => s.status === "PENDING_DELIVERY").length,
      closed: sales.filter((s) => s.status === "CLOSED").length,
    }),
    [sales],
  );

  const filters: { label: string; value: FilterType }[] = useMemo(
    () => [
      { label: `Todas (${stats.total})`, value: "ALL" as FilterType },
      {
        label: `Pendientes (${
          stats.adminValidation + stats.envVisit + stats.delivery
        })`,
        value: "PENDING" as FilterType,
      },
      { label: `Cerradas (${stats.closed})`, value: "CLOSED" as FilterType },
    ],
    [stats],
  );

  return {
    filter,
    setFilter,
    filteredSales,
    stats,
    filters,
  };
}
