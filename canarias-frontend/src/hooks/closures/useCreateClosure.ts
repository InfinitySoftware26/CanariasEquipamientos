"use client";

import { useState } from "react";

import { createClosure } from "@/services/closures/closures.service";
import { CreateClosurePayload } from "@/types/closures/closure.types";

export function useCreateClosure() {
  const [loading, setLoading] = useState(false);

  const create = async (payload: CreateClosurePayload) => {
    try {
      setLoading(true);

      return await createClosure(payload);
    } finally {
      setLoading(false);
    }
  };

  return {
    create,
    loading,
  };
}
