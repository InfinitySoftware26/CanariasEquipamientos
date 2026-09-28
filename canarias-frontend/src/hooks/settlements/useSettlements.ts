"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { getSettlements } from "@/services/settlements/settlements.service";
import {
  Settlement,
  SettlementFilters,
  SettlementStatus,
} from "@/types/settlements/settlement.types";

const STATUS_FILTERS: { label: string; value: "all" | SettlementStatus }[] = [
  { label: "Todas", value: "all" },
  { label: "Pendientes", value: "pending" },
  { label: "Aprobadas", value: "validated" },
  { label: "Rechazadas", value: "rejected" },
];

export function useSettlements() {
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [status, setStatus] = useState<"all" | SettlementStatus>("all");
  const [staffId, setStaffId] = useState("");

  const loadSettlements = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const filters: SettlementFilters = {};

      if (status !== "all") filters.status = status;
      if (staffId.trim()) filters.staffId = staffId.trim();

      const response = await getSettlements(filters);

      setSettlements(response);
    } catch (err) {
      console.error(err);

      setSettlements([]);

      setError(
        err instanceof Error
          ? err.message
          : "No se pudieron cargar las liquidaciones",
      );
    } finally {
      setLoading(false);
    }
  }, [status, staffId]);

  useEffect(() => {
    loadSettlements();
  }, [loadSettlements]);

  const stats = useMemo(() => {
    return {
      total: settlements.length,

      pending: settlements.filter((s) => s.status === "pending").length,

      validated: settlements.filter((s) => s.status === "validated").length,

      rejected: settlements.filter((s) => s.status === "rejected").length,

      totalOutstanding: settlements.reduce(
        (sum, s) => sum + Number(s.outstandingDebt),
        0,
      ),
    };
  }, [settlements]);

  return {
    settlements,
    loading,
    error,
    refresh: loadSettlements,
    status,
    setStatus,
    staffId,
    setStaffId,
    filters: STATUS_FILTERS,
    stats,
  };
}
