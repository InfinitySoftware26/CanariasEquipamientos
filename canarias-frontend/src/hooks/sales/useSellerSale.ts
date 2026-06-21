"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getMySales } from "@/services/sales.service";
import { Sale } from "@/types/sales/sale.type";

type FilterType = "ALL" | "PENDING" | "CLOSED";

const normalizeSale = (sale: Sale): Sale => ({
  ...sale,
  status: sale.status.toUpperCase() as Sale["status"],
});

const PENDING_STATUSES = [
  "PENDING_ADMIN_VALIDATION",
  "PENDING_ENVIRONMENTAL_VISIT",
  "PENDING_DELIVERY",
];

export function useSellerSales() {
  const router = useRouter();

  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [filter, setFilter] = useState<FilterType>("ALL");

  // ---------------- LOAD (único flujo) ----------------
  const loadSales = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getMySales();

      if (!Array.isArray(data)) {
        throw new Error("Respuesta inválida de ventas");
      }

      setSales(data.map(normalizeSale));
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar tus ventas");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSales();
  }, [loadSales]);

  // ---------------- FILTERED SALES ----------------
  const filteredSales = useMemo(() => {
    if (filter === "ALL") return sales;

    if (filter === "PENDING") {
      return sales.filter((s) => PENDING_STATUSES.includes(s.status));
    }

    return sales.filter((s) => s.status === "CLOSED");
  }, [sales, filter]);

  // ---------------- STATS ----------------
  const stats = useMemo(() => {
    return sales.reduce(
      (acc, sale) => {
        acc.total++;

        if (PENDING_STATUSES.includes(sale.status)) {
          if (sale.status === "PENDING_ADMIN_VALIDATION") acc.adminValidation++;
          if (sale.status === "PENDING_ENVIRONMENTAL_VISIT") acc.envVisit++;
          if (sale.status === "PENDING_DELIVERY") acc.delivery++;
        }

        if (sale.status === "CLOSED") acc.closed++;

        return acc;
      },
      {
        total: 0,
        adminValidation: 0,
        envVisit: 0,
        delivery: 0,
        closed: 0,
      },
    );
  }, [sales]);

  // ---------------- ACTIONS ----------------
  const refresh = useCallback(() => {
    loadSales();
  }, [loadSales]);

  const goToSale = useCallback(
    (id: string) => {
      router.push(`/sales/${id}`);
    },
    [router],
  );

  return {
    sales: filteredSales,

    loading,
    error,

    filter,
    setFilter,

    stats,

    refresh,
    goToSale,
  };
}
