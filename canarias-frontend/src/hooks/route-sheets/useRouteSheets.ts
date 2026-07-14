"use client";

import { getRouteSheets } from "@/services/route-sheets/routeSheets.service";
import { RouteSheet } from "@/types/rotue-sheets/routeSheets.types";
import { useCallback, useEffect, useState } from "react";

interface UseRouteSheetsReturn {
  routeSheets: RouteSheet[];
  loading: boolean;
  error: string;
  reload: () => Promise<void>;
}

export function useRouteSheets(): UseRouteSheetsReturn {
  const [routeSheets, setRouteSheets] = useState<RouteSheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadRouteSheets = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getRouteSheets();

      setRouteSheets(data);
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar las hojas de ruta.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRouteSheets();
  }, [loadRouteSheets]);

  return {
    routeSheets,
    loading,
    error,
    reload: loadRouteSheets,
  };
}
