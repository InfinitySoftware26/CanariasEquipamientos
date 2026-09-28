"use client";

import { useCallback, useEffect, useState } from "react";

import {
  getClosureById,
  getClosureReconciliation,
} from "@/services/closures/closures.service";
import {
  ClosureReconciliation,
  DailyClosure,
} from "@/types/closures/closure.types";

export function useClosureDetail(id: string, canViewReconciliation: boolean) {
  const [closure, setClosure] = useState<DailyClosure | null>(null);
  const [reconciliation, setReconciliation] =
    useState<ClosureReconciliation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDetail = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [closureResult, reconciliationResult] = await Promise.allSettled([
        getClosureById(id),
        canViewReconciliation
          ? getClosureReconciliation(id)
          : Promise.resolve(null),
      ]);

      if (closureResult.status === "rejected") {
        throw closureResult.reason;
      }

      setClosure(closureResult.value);

      if (reconciliationResult.status === "fulfilled") {
        setReconciliation(reconciliationResult.value);
      } else {
        // 403 esperado para roles sin permiso (ej. cobrador): se oculta la sección.
        console.error(reconciliationResult.reason);

        setReconciliation(null);
      }
    } catch (err) {
      console.error(err);

      setClosure(null);

      setError(
        err instanceof Error ? err.message : "No se pudo cargar el cierre",
      );
    } finally {
      setLoading(false);
    }
  }, [id, canViewReconciliation]);

  useEffect(() => {
    if (id) {
      loadDetail();
    }
  }, [id, loadDetail]);

  return {
    closure,
    reconciliation,
    loading,
    error,
    refresh: loadDetail,
  };
}
