"use client";

import { useMemo } from "react";

interface LoanSimulatorInput {
  price: number;
  installments: number;
  rate: number;
}

interface LoanSimulatorResult {
  totalFinanced: number;
  installmentValue: number;
}

export function useLoanSimulator({
  price,
  installments,
  rate,
}: LoanSimulatorInput): LoanSimulatorResult {
  return useMemo(() => {
    if (
      !Number.isFinite(price) ||
      price <= 0 ||
      !Number.isFinite(installments) ||
      installments <= 0
    ) {
      return { totalFinanced: 0, installmentValue: 0 };
    }

    const totalFinanced = price * (1 + rate);
    const installmentValue = totalFinanced / installments;

    return { totalFinanced, installmentValue };
  }, [price, installments, rate]);
}
