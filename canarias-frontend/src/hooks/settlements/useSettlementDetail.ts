"use client";

import { useCallback, useEffect, useState } from "react";

import { getSettlementById } from "@/services/settlements/settlements.service";
import { Settlement } from "@/types/settlements/settlement.types";

export function useSettlementDetail(id: string) {
  const [settlement, setSettlement] = useState<Settlement | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSettlement = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getSettlementById(id);

      setSettlement(data);
    } catch (err) {
      console.error(err);

      setSettlement(null);

      setError(
        err instanceof Error
          ? err.message
          : "No se pudo cargar la liquidación",
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      loadSettlement();
    }
  }, [id, loadSettlement]);

  return {
    settlement,
    loading,
    error,
    refresh: loadSettlement,
  };
}
