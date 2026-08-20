"use client";

import { useCallback, useEffect, useState } from "react";

import { getInstallmentsByClient } from "@/services/installments/installments.service";
import { Installment } from "@/types/installments/installment.types";

export function useClientInstallments(clientId: string | null) {
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadInstallments = useCallback(async () => {
    if (!clientId) {
      setInstallments([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await getInstallmentsByClient(clientId);

      setInstallments(response);
    } catch (err) {
      console.error(err);

      setInstallments([]);

      setError(
        err instanceof Error
          ? err.message
          : "No se pudieron cargar las cuotas del cliente",
      );
    } finally {
      setLoading(false);
    }
  }, [clientId]);

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
