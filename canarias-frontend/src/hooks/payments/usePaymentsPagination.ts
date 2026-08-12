"use client";

import { Payment } from "@/types/payments/payment.types";
import { useMemo, useState } from "react";

const PAGE_SIZE = 10;

export function usePaymentsPagination(payments: Payment[]) {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(payments.length / PAGE_SIZE));

  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;

    return payments.slice(start, start + PAGE_SIZE);
  }, [payments, page]);

  return {
    paginated,
    page,
    setPage,
    totalPages,
  };
}
