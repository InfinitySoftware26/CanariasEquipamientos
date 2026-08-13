"use client";

import { useCallback, useEffect, useState } from "react";

import { getOverdueInstallments } from "@/services/installments/installments.service";
import { Installment } from "@/types/installments/installment.types";

export function useOverdueInstallments() {
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadInstallments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getOverdueInstallments();

      setInstallments(response);
    } catch (err) {
      console.error(err);

      setInstallments([]);

      setError(
        err instanceof Error
          ? err.message
          : "No se pudieron cargar las cuotas vencidas",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInstallments();
  }, [loadInstallments]);

  return {
    installments,
    loading,
    error,
    refresh: loadInstallments,
  };
}
