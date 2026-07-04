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
  const [search, setSearch] = useState("");

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

    let result = normalizedSales;

    // Filtro por estado
    if (activeFilter === "PENDING") {
      result = result.filter((s) => PENDING_STATUSES.includes(s.status));
    } else if (activeFilter === "CLOSED") {
      result = result.filter((s) => s.status === "closed");
    } else if (activeFilter !== "ALL") {
      result = result.filter((s) => s.status === activeFilter);
    }

    // Filtro por búsqueda
    if (search.trim()) {
      const value = search.toLowerCase();

      result = result.filter((sale) => {
        const client =
          `${sale.client?.name ?? ""} ${sale.client?.surname ?? ""}`.toLowerCase();

        const saleId = sale.saleId.toLowerCase();

        return client.includes(value) || saleId.includes(value);
      });
    }

    return result;
  }, [normalizedSales, filter, queryStatus, search]);

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
    search, // Placeholder for search functionality
    setSearch, // Placeholder for search functionality
  };
}
