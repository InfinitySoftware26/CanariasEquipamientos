"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { getClosures } from "@/services/closures/closures.service";
import {
  ClosureFilters,
  DailyClosure,
  DailyClosureStatus,
} from "@/types/closures/closure.types";

const STATUS_FILTERS: { label: string; value: "all" | DailyClosureStatus }[] = [
  { label: "Todos", value: "all" },
  { label: "Pendientes", value: "pending" },
  { label: "Aprobados", value: "validated" },
  { label: "Rechazados", value: "rejected" },
];

export function useClosures() {
  const [closures, setClosures] = useState<DailyClosure[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [status, setStatus] = useState<"all" | DailyClosureStatus>("all");
  const [closingDate, setClosingDate] = useState("");

  const loadClosures = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const filters: ClosureFilters = {};

      if (status !== "all") filters.status = status;
      if (closingDate) filters.closingDate = closingDate;

      const response = await getClosures(filters);

      setClosures(response);
    } catch (err) {
      console.error(err);

      setClosures([]);

      setError(
        err instanceof Error
          ? err.message
          : "No se pudieron cargar los cierres diarios",
      );
    } finally {
      setLoading(false);
    }
  }, [status, closingDate]);

  useEffect(() => {
    loadClosures();
  }, [loadClosures]);

  const stats = useMemo(() => {
    return {
      total: closures.length,

      pending: closures.filter((c) => c.status === "pending").length,

      validated: closures.filter((c) => c.status === "validated").length,

      rejected: closures.filter((c) => c.status === "rejected").length,

      totalDeclared: closures.reduce(
        (sum, c) => sum + Number(c.totalCollected),
        0,
      ),
    };
  }, [closures]);

  return {
    closures,
    loading,
    error,
    refresh: loadClosures,
    status,
    setStatus,
    closingDate,
    setClosingDate,
    filters: STATUS_FILTERS,
    stats,
  };
}
