"use client";

import { useCallback, useEffect, useState } from "react";

import { Sale } from "@/types/sales/sale.type";
import { getCollectorSales } from "@/services/collectors/collectors.services";

/**
 * Normaliza status de forma segura
 * Evita null, undefined u objetos raros
 */
const normalizeSale = (sale: Sale): Sale => {
  const status = sale.status;

  return {
    ...sale,
    status: status,
  };
};

export function useCollectorSales() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSales = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getCollectorSales();

      const salesArray: Sale[] = Array.isArray(response)
        ? response
        : (response?.data ?? []);

      const normalized = salesArray.map(normalizeSale);

      console.log(
        "RAW:",
        salesArray.map((s) => s.status),
      );
      console.log(
        "NORMALIZED:",
        normalized.map((s) => s.status),
      );

      setSales(normalized);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "No se pudieron cargar las ventas",
      );
      setSales([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSales();
  }, [loadSales]);

  return {
    sales,
    loading,
    error,
    refresh: loadSales,
  };
}
