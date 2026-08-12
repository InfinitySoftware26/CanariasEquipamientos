"use client";

import { useCallback, useEffect, useState } from "react";

import { getPayments } from "@/services/payments/payments.service";
import { Payment } from "@/types/payments/payment.types";

export function usePayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPayments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getPayments();

      setPayments(response);
    } catch (err) {
      console.error(err);

      setPayments([]);

      setError(
        err instanceof Error ? err.message : "No se pudieron cargar los pagos",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  return {
    payments,
    loading,
    error,
    refresh: loadPayments,
  };
}
