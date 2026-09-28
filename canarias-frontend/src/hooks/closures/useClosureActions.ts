"use client";

import { useState } from "react";

import { validateClosure } from "@/services/closures/closures.service";

export function useClosureActions() {
  const [loading, setLoading] = useState(false);

  const approve = async (id: string, observations?: string) => {
    try {
      setLoading(true);

      await validateClosure(id, { status: "validated", observations });
    } finally {
      setLoading(false);
    }
  };

  const reject = async (id: string, observations?: string) => {
    try {
      setLoading(true);

      await validateClosure(id, { status: "rejected", observations });
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
