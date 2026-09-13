"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { getFailedVisits } from "@/services/failed-visits/failed-visits.service";
import {
  FailedVisit,
  FailedVisitFilters,
  FailedVisitStatus,
} from "@/types/failed-visits/failed-visitis.type";

const STATUS_FILTERS: { label: string; value: "all" | FailedVisitStatus }[] = [
  { label: "Todas", value: "all" },
  { label: "Pendientes", value: "pending" },
  { label: "Reprogramadas", value: "rescheduled" },
];

export function useFailedVisits() {
  const [failedVisits, setFailedVisits] = useState<FailedVisit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [status, setStatus] = useState<"all" | FailedVisitStatus>("all");
  const [search, setSearch] = useState("");

  const loadFailedVisits = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const filters: FailedVisitFilters = {};

      if (status !== "all") {
        filters.status = status;
      }

      const response = await getFailedVisits(filters);

      setFailedVisits(response);
    } catch (err) {
      console.error(err);

      setFailedVisits([]);

      setError(
        err instanceof Error
          ? err.message
          : "No se pudieron cargar las visitas fallidas",
      );
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    loadFailedVisits();
  }, [loadFailedVisits]);

  const filteredFailedVisits = useMemo(() => {
    if (!search.trim()) return failedVisits;

    const term = search.trim().toLowerCase();

    return failedVisits.filter(
      (visit) =>
        visit.clientId.toLowerCase().includes(term) ||
        visit.saleId.toLowerCase().includes(term),
    );
  }, [failedVisits, search]);

  const stats = useMemo(() => {
    return {
      total: failedVisits.length,
      pending: failedVisits.filter((v) => !v.rescheduledDate).length,
      rescheduled: failedVisits.filter((v) => v.rescheduledDate).length,
    };
  }, [failedVisits]);

  return {
    failedVisits: filteredFailedVisits,
    loading,
    error,
    refresh: loadFailedVisits,
    status,
    setStatus,
    search,
    setSearch,
    filters: STATUS_FILTERS,
    stats,
  };
}
