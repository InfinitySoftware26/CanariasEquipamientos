"use client";

import { useState } from "react";

import { payInstallment } from "@/services/installments/installments.service";

export function usePayInstallment() {
  const [loading, setLoading] = useState(false);

  const pay = async (installmentId: string, amount: number) => {
    try {
      setLoading(true);

      await payInstallment(installmentId, { amount });
    } finally {
      setLoading(false);
    }
  };

  return {
    pay,
    loading,
  };
}
