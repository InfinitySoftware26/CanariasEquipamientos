"use client";

import { Payment } from "@/types/payments/payment.types";
import { useMemo, useState } from "react";

export function usePaymentsView(payments: Payment[]) {
  const [search, setSearch] = useState("");

  const [filter, setFilter] = useState("all");

  const filteredPayments = useMemo(() => {
    let data = [...payments];

    if (search.trim()) {
      const value = search.toLowerCase();

      data = data.filter(
        (payment) =>
          payment.clientId.toLowerCase().includes(value) ||
          payment.saleId.toLowerCase().includes(value),
      );
    }

    if (filter !== "all") {
      data = data.filter((payment) => payment.method === filter);
    }

    return data;
  }, [payments, search, filter]);

  const stats = useMemo(() => {
    return {
      total: payments.length,

      amount: payments.reduce((sum, p) => sum + Number(p.amount), 0),

      cash: payments.filter((p) => p.method === "cash").length,

      transfer: payments.filter((p) => p.method === "transfer").length,
    };
  }, [payments]);

  const filters = [
    {
      label: "Todos",
      value: "all",
    },
    {
      label: "Efectivo",
      value: "cash",
    },
    {
      label: "Transferencia",
      value: "transfer",
    },
    {
      label: "Débito",
      value: "debit_card",
    },
    {
      label: "Crédito",
      value: "credit_card",
    },
    {
      label: "Mercado Pago",
      value: "mercado_pago",
    },
    {
      label: "Cheque",
      value: "check",
    },
  ];

  return {
    search,
    setSearch,
    filter,
    setFilter,
    filteredPayments,
    filters,
    stats,
  };
}
