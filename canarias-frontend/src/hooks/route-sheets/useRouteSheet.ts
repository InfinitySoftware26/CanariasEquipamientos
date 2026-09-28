"use client";

import { useCallback, useEffect, useState } from "react";

import { getRouteSheetById } from "@/services/route-sheets/routeSheets.service";
import { RouteSheetDetail } from "@/types/rotue-sheets/routeSheets.types";

interface UseRouteSheetReturn {
  routeSheet: RouteSheetDetail | null;
  loading: boolean;
  error: string;
  reload: () => Promise<void>;
}

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function useRouteSheet(routeSheetId?: string): UseRouteSheetReturn {
  const [routeSheet, setRouteSheet] = useState<RouteSheetDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadRouteSheet = useCallback(async () => {
    if (!routeSheetId) {
      setRouteSheet(null);
      setError("No se pudo identificar la hoja de ruta.");
      setLoading(false);
      return;
    }

    if (!UUID_REGEX.test(routeSheetId)) {
      console.error("❌ ID de hoja de ruta inválido:", routeSheetId);

      setRouteSheet(null);
      setError("No se pudo cargar la hoja de ruta.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data = await getRouteSheetById(routeSheetId);

      setRouteSheet(data);
    } catch (err) {
      console.error("❌ Error cargando hoja de ruta:", err);

      setRouteSheet(null);
      setError(
        "Ocurrió un problema al cargar la hoja de ruta. Intentá nuevamente.",
      );
    } finally {
      setLoading(false);
    }
  }, [routeSheetId]);

  useEffect(() => {
    void loadRouteSheet();
  }, [loadRouteSheet]);

  return {
    routeSheet,
    loading,
    error,
    reload: loadRouteSheet,
  };
}
