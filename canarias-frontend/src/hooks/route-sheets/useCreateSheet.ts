"use client";

import { createRouteSheet } from "@/services/route-sheets/routeSheets.service";
import { CreateRouteSheetPayload } from "@/types/rotue-sheets/createRouteSheets.type";
import { RouteSheetDetail } from "@/types/rotue-sheets/routeSheets.types";
import { useState } from "react";

interface UseCreateRouteSheetReturn {
  loading: boolean;
  error: string;
  create: (payload: CreateRouteSheetPayload) => Promise<RouteSheetDetail>;
}

export function useCreateRouteSheet(): UseCreateRouteSheetReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function create(
    payload: CreateRouteSheetPayload,
  ): Promise<RouteSheetDetail> {
    try {
      setLoading(true);
      setError("");

      return await createRouteSheet(payload);
    } catch (err) {
      console.error(err);

      const message =
        err instanceof Error
          ? err.message
          : "No se pudo crear la hoja de ruta.";

      setError(message);

      throw err;
    } finally {
      setLoading(false);
    }
  }

  return {
    loading,
    error,
    create,
  };
}
