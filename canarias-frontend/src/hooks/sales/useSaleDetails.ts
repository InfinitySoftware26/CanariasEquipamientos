"use client";

import { useCallback, useEffect, useState } from "react";

import { getSaleById } from "@/services/sales.service";
import { Sale } from "@/types/sales/sale.type";

export function useSaleDetail(saleId: string) {
  const [sale, setSale] = useState<Sale | null>(null);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const loadSale = useCallback(async () => {
    if (!saleId) return;

    try {
      setLoading(true);
      setError(null);

      const data = await getSaleById(saleId);

      setSale(data);
    } catch (err) {
      console.error(err);

      setError("No se pudo cargar la venta");
    } finally {
      setLoading(false);
    }
  }, [saleId]);

  useEffect(() => {
    loadSale();
  }, [loadSale]);

  return {
    sale,
    loading,
    error,
    refresh: loadSale,
  };
}
