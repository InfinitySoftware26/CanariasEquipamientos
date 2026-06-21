"use client";

import { useEffect, useState } from "react";

import { getPendingSales } from "@/services/sales.service";

import { Sale } from "@/types/sales/sale.type";

export function usePendingSales() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  async function loadSales() {
    try {
      setLoading(true);

      const data = await getPendingSales();

      setSales(data);
    } catch (err) {
      console.error(err);

      setError("No se pudieron cargar las ventas");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    async function init() {
      try {
        setLoading(true);

        const data = await getPendingSales();

        setSales(data);
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar las ventas");
      } finally {
        setLoading(false);
      }
    }

    void init();
  }, []);

  return {
    sales,
    loading,
    error,
    refresh: loadSales,
  };
}
