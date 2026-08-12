"use client";

import { useCallback, useEffect, useState } from "react";

import { getMyRouteSheets } from "@/services/route-sheets/routeSheets.service";

import { RouteSheet } from "@/types/rotue-sheets/routeSheets.types";

export function useMyRouteSheets() {
  const [routeSheets, setRouteSheets] = useState<RouteSheet[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    try {
      setLoading(true);

      const data = await getMyRouteSheets();

      console.log("🟢 MIS HOJAS DE RUTA:", data);

      setRouteSheets(data);
    } catch (error) {
      console.error("🔴 ERROR OBTENIENDO MIS HOJAS:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return {
    routeSheets,
    loading,
    reload,
  };
}
