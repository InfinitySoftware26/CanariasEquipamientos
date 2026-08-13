"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { getSales } from "@/services/sales.service";
import { getInstallmentsByClient } from "@/services/installments/installments.service";
import { getPayments } from "@/services/payments/payments.service";
import { Sale } from "@/types/sales/sale.type";
import { Installment } from "@/types/installments/installment.types";
import { Payment } from "@/types/payments/payment.types";

// El backend no soporta GET /sales?clientId=, así que se trae la sociedad
// completa y se filtra client-side (deuda técnica: pendiente de un filtro
// server-side cuando el backend lo exponga).

// "Activa" = todo estado que no sea final. "cancelled" no existe como
// status real de Sale (no está en el enum del backend), se deja fuera del
// set por eso; "delivered" sí cuenta como activa porque todavía no cerró.
const EXCLUDED_SALE_STATUSES = new Set<Sale["status"]>([
  "closed",
  "rejected_admin",
  "environmental_rejected",
]);

const PENDING_INSTALLMENT_STATUSES = new Set<Installment["status"]>([
  "pending",
  "overdue",
  "partial",
]);

export function useClientCommercialSummary(clientId: string) {
  const [sales, setSales] = useState<Sale[]>([]);
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSummary = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [allSales, clientInstallments, clientPayments] = await Promise.all(
        [
          getSales(),
          getInstallmentsByClient(clientId),
          getPayments({ clientId }),
        ],
      );

      const clientSales = allSales
        .filter((sale) => sale.clientId === clientId)
        .sort(
          (a, b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime(),
        );

      setSales(clientSales);
      setInstallments(clientInstallments);
      setPayments(clientPayments);
    } catch (err) {
      console.error(err);

      setSales([]);
      setInstallments([]);
      setPayments([]);

      setError(
        err instanceof Error
          ? err.message
          : "No se pudo cargar la situación comercial del cliente",
      );
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    if (clientId) {
      loadSummary();
    }
  }, [clientId, loadSummary]);

  const stats = useMemo(() => {
    const activeSalesCount = sales.filter(
      (sale) => !EXCLUDED_SALE_STATUSES.has(sale.status),
    ).length;

    // "defaulted" no entra en el conteo (es una categoría especial), pero
    // sigue apareciendo en la tabla de cuotas del cliente.
    const pendingInstallments = installments.filter((installment) =>
      PENDING_INSTALLMENT_STATUSES.has(installment.status),
    );

    const totalDebt = pendingInstallments.reduce(
      (sum, installment) => sum + Number(installment.remainingAmount),
      0,
    );

    const lastPaymentDate =
      [...payments].sort(
        (a, b) =>
          new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime(),
      )[0]?.paymentDate ?? null;

    return {
      activeSalesCount,
      pendingInstallmentsCount: pendingInstallments.length,
      totalDebt,
      lastPaymentDate,
    };
  }, [sales, installments, payments]);

  return {
    sales,
    installments,
    loading,
    error,
    refresh: loadSummary,
    stats,
  };
}
