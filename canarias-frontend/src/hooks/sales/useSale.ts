"use client";

import { useEffect, useState, useCallback } from "react";
import { getSales } from "@/services/sales.service";
import { Sale } from "@/types/sales/sale.type";

function normalizeSale(sale: Sale): Sale {
  return {
    ...sale,
    status: sale.status?.toUpperCase() as Sale["status"],
  };
}

export function useSales() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSales = useCallback(async () => {
    let isMounted = true;

    try {
      setLoading(true);
      setError(null);

      const data = await getSales();

      if (!Array.isArray(data)) {
        throw new Error("Respuesta inválida de ventas");
      }

      if (isMounted) {
        setSales(data.map(normalizeSale));
      }
    } catch (err) {
      console.error(err);

      if (isMounted) {
        setError("No se pudieron cargar las ventas");
      }
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }

    return () => {
      isMounted = false;
    };
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
