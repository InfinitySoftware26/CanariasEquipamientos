"use client";

import { useState } from "react";

import { updateRouteSheetStatus } from "@/services/route-sheets/routeSheets.service";

import { RouteSheetStatus } from "@/types/rotue-sheets/routeSheets.types";

interface Return {
  loading: boolean;
  error: string;
  update: (id: string, status: RouteSheetStatus) => Promise<void>;
}

export function useUpdateRouteSheetStatus(): Return {
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  async function update(id: string, status: RouteSheetStatus) {
    try {
      setLoading(true);
      setError("");

      await updateRouteSheetStatus(id, {
        status,
      });
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error ? err.message : "Error actualizando estado",
      );

      throw err;
    } finally {
      setLoading(false);
    }
  }

  return {
    loading,
    error,
    update,
  };
}
