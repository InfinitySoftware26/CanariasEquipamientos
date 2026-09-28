"use client";

import { useMemo, useState } from "react";

import { Installment } from "@/types/installments/installment.types";

const PAGE_SIZE = 10;

export function useInstallmentsPagination(installments: Installment[]) {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(installments.length / PAGE_SIZE));

  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;

    return installments.slice(start, start + PAGE_SIZE);
  }, [installments, page]);

  return {
    paginated,
    page,
    setPage,
    totalPages,
  };
}
