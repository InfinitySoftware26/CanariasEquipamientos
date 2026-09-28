"use client";

import { useCallback, useEffect, useState } from "react";

import { getRouteSheetById } from "@/services/route-sheets/routeSheets.service";

import { RouteSheetItem } from "@/types/rotue-sheets/routeSheets.types";

interface UseRouteSheetItemsReturn {
  items: RouteSheetItem[];
  loading: boolean;
  error: string;
  reload: () => Promise<void>;
}

export function useRouteSheetItems(
  routeSheetId: string,
): UseRouteSheetItemsReturn {
  const [items, setItems] = useState<RouteSheetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadItems = useCallback(async () => {
    if (!routeSheetId) {
      setItems([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const routeSheet = await getRouteSheetById(routeSheetId);

      const routeItems = Array.isArray(routeSheet?.items)
        ? routeSheet.items
        : [];

      console.log("📦 ITEMS ENRIQUECIDOS:", routeItems);

      setItems(routeItems);
    } catch (err) {
      console.error("❌ Error obteniendo items de la hoja:", err);

      setItems([]);
      setError("No se pudieron cargar los recorridos.");
    } finally {
      setLoading(false);
    }
  }, [routeSheetId]);

  useEffect(() => {
    void loadItems();
  }, [loadItems]);

  return {
    items,
    loading,
    error,
    reload: loadItems,
  };
}
