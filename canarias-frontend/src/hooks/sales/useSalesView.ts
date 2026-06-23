import { Sale } from "@/types/sales/sale.type";
import { useMemo, useState } from "react";

type FilterType = "ALL" | "PENDING" | "CLOSED";

const normalizeStatus = (status?: string) =>
  (status ?? "").toLowerCase().trim().replace(/-/g, "_");

const PENDING_STATUSES = [
  "pending_admin_validation",
  "pending_environmental_visit",
  "pending_delivery",
];

// 🔥 MAP QUERY PARAM → STATUS INTERNO
const QUERY_STATUS_MAP: Record<string, string> = {
  PENDING_ADMIN_VALIDATION: "pending_admin_validation",
  PENDING_ENVIRONMENTAL_VISIT: "pending_environmental_visit",
  PENDING_DELIVERY: "pending_delivery",
  CLOSED: "closed",
};

export function useSalesView(sales: Sale[], statusFromQuery?: string) {
  const [filter, setFilter] = useState<FilterType>("ALL");

  // 🔥 traducimos query param a status interno real
  const queryStatus = statusFromQuery
    ? QUERY_STATUS_MAP[statusFromQuery]
    : null;

  // 🔥 normalizamos sales UNA sola vez
  const normalizedSales = useMemo(() => {
    return (sales ?? []).map((s) => ({
      ...s,
      status: normalizeStatus(s.status) as Sale["status"],
    }));
  }, [sales]);

  // 🔥 filtrado único (UI + URL)
  const filteredSales = useMemo(() => {
    const activeFilter = queryStatus ?? filter;

    if (activeFilter === "ALL") return normalizedSales;

    if (activeFilter === "PENDING") {
      return normalizedSales.filter((s) => PENDING_STATUSES.includes(s.status));
    }

    if (activeFilter === "CLOSED") {
      return normalizedSales.filter((s) => s.status === "closed");
    }

    // 🔥 si viene status directo desde query (ej pending_delivery)
    return normalizedSales.filter((s) => s.status === activeFilter);
  }, [normalizedSales, filter, queryStatus]);

  // 🔥 stats consistentes
  const stats = useMemo(() => {
    return {
      total: normalizedSales.length,
      adminValidation: normalizedSales.filter(
        (s) => s.status === "pending_admin_validation",
      ).length,
      envVisit: normalizedSales.filter(
        (s) => s.status === "pending_environmental_visit",
      ).length,
      delivery: normalizedSales.filter((s) => s.status === "pending_delivery")
        .length,
      closed: normalizedSales.filter((s) => s.status === "closed").length,
    };
  }, [normalizedSales]);

  // 🔥 filtros UI
  const filters: { label: string; value: FilterType }[] = useMemo(
    () => [
      { label: `Todas (${stats.total})`, value: "ALL" },
      {
        label: `Pendientes (${
          stats.adminValidation + stats.envVisit + stats.delivery
        })`,
        value: "PENDING",
      },
      { label: `Cerradas (${stats.closed})`, value: "CLOSED" },
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
