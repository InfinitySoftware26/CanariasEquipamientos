"use client";

import { useState } from "react";

import { createRouteSheet } from "@/services/route-sheets/routeSheets.service";

import { CreateRouteSheetPayload } from "@/types/rotue-sheets/createRouteSheets.type";

import { RouteSheetDetail } from "@/types/rotue-sheets/routeSheets.types";

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

      console.log("==========================================");
      console.log("🚀 useCreateRouteSheet");
      console.log("==========================================");
      console.log("PAYLOAD:", payload);

      const result = await createRouteSheet(payload);

      console.log("==========================================");
      console.log("✅ useCreateRouteSheet - HOJA CREADA");
      console.log("==========================================");
      console.log("RESULT:", result);

      return result;
    } catch (err) {
      console.error("==========================================");
      console.error("❌ useCreateRouteSheet - ERROR");
      console.error("==========================================");
      console.error(err);

      const message =
        err instanceof Error
          ? err.message
          : "No se pudo crear la hoja de ruta.";

      setError(message);

      // Importante:
      // El componente que llamó a create()
      // necesita recibir el error.
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
