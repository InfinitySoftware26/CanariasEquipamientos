"use client";

import { getRouteSheetById } from "@/services/route-sheets/routeSheets.service";
import { RouteSheetDetail } from "@/types/rotue-sheets/routeSheets.types";
import { useCallback, useEffect, useState } from "react";

interface UseRouteSheetReturn {
  routeSheet: RouteSheetDetail | null;
  loading: boolean;
  error: string;
  reload: () => Promise<void>;
}

export function useRouteSheet(routeSheetId: string): UseRouteSheetReturn {
  const [routeSheet, setRouteSheet] = useState<RouteSheetDetail | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const loadRouteSheet = useCallback(async () => {
    if (!routeSheetId) return;

    try {
      setLoading(true);
      setError("");

      const data = await getRouteSheetById(routeSheetId);

      setRouteSheet(data);
    } catch (err) {
      console.error(err);
      setError("No se pudo cargar la hoja de ruta.");
    } finally {
      setLoading(false);
    }
  }, [routeSheetId]);

  useEffect(() => {
    loadRouteSheet();
  }, [loadRouteSheet]);

  return {
    routeSheet,
    loading,
    error,
    reload: loadRouteSheet,
  };
}
