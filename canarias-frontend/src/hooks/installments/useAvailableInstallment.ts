"use client";

import { useCallback, useState } from "react";

import { getAvailableInstallments } from "@/services/route-sheets/routeSheets.service";

import { AvailableRouteInstallment } from "@/types/rotue-sheets/available-installment.type";

export function useAvailableInstallments() {
  const [installments, setInstallments] = useState<AvailableRouteInstallment[]>(
    [],
  );

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const loadInstallments = useCallback(
    async (zoneId: string, staffId: string, routeDate: string) => {
      if (!zoneId || !staffId || !routeDate) {
        setInstallments([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const data = await getAvailableInstallments(zoneId, staffId, routeDate);

        setInstallments(data);
      } catch (err) {
        console.error("Error obteniendo cuotas disponibles:", err);

        setInstallments([]);

        setError(
          err instanceof Error
            ? err.message
            : "No se pudieron obtener las cuotas",
        );
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return {
    installments,
    loading,
    error,
    loadInstallments,
  };
}
