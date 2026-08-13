"use client";

import { useState } from "react";

import { validateSettlement } from "@/services/settlements/settlements.service";

export function useSettlementActions() {
  const [loading, setLoading] = useState(false);

  const approve = async (id: string, observations?: string) => {
    try {
      setLoading(true);

      await validateSettlement(id, { status: "validated", observations });
    } finally {
      setLoading(false);
    }
  };

  const reject = async (id: string, observations?: string) => {
    try {
      setLoading(true);

      await validateSettlement(id, { status: "rejected", observations });
    } finally {
      setLoading(false);
    }
  };

  return {
    approve,
    reject,
    loading,
  };
}
