"use client";

import { useCallback, useEffect, useState } from "react";

import { Sale } from "@/types/sales/sale.type";
import { getCollectorSales } from "@/services/collectors/collectors.services";
import { normalizeSaleStatus } from "@/types/sales/saleStatus.mapper";

const normalizeSale = (sale: Sale): Sale => ({
  ...sale,
  status: normalizeSaleStatus(sale.status) as Sale["status"],
});

export function useCollectorSales() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSales = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getCollectorSales();

      // 🔥 FIX CRÍTICO: soporta distintos formatos de API
      const salesArray: Sale[] = Array.isArray(response)
        ? response
        : (response?.data ?? []);

      const normalized = salesArray.map(normalizeSale);

      setSales(normalized);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "No se pudieron cargar las ventas asignadas";

      setError(message ?? "No se pudieron cargar las ventas asignadas");

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
