"use client";

import { useMemo, useState } from "react";

import { Installment } from "@/types/installments/installment.types";

export function useInstallmentsView(installments: Installment[]) {
  const [search, setSearch] = useState("");

  const [filter, setFilter] = useState("all");

  const filteredInstallments = useMemo(() => {
    let data = [...installments];

    if (search.trim()) {
      const value = search.toLowerCase();

      data = data.filter(
        (installment) =>
          installment.clientId.toLowerCase().includes(value) ||
          installment.saleId.toLowerCase().includes(value),
      );
    }

    if (filter !== "all") {
      data = data.filter((installment) => installment.status === filter);
    }

    return data;
  }, [installments, search, filter]);

  const stats = useMemo(() => {
    return {
      total: installments.length,

      amountDue: installments.reduce(
        (sum, i) => sum + Number(i.remainingAmount),
        0,
      ),

      overdue: installments.filter((i) => i.status === "overdue").length,

      partial: installments.filter((i) => i.status === "partial").length,
    };
  }, [installments]);

  const filters = [
    { label: "Todas", value: "all" },
    { label: "Pendientes", value: "pending" },
    { label: "Vencidas", value: "overdue" },
    { label: "Parciales", value: "partial" },
    { label: "Pagadas", value: "paid" },
    { label: "Incobrables", value: "defaulted" },
  ];

  return {
    search,
    setSearch,
    filter,
    setFilter,
    filteredInstallments,
    filters,
    stats,
  };
}
