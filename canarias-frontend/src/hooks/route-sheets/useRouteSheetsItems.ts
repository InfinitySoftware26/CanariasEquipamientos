"use client";

import { getRouteSheetItems } from "@/services/route-sheets/routeSheetsItems.service";
import { RouteSheetItem } from "@/types/rotue-sheets/routeSheets.types";
import { useCallback, useEffect, useState } from "react";

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
    if (!routeSheetId) return;

    try {
      setLoading(true);
      setError("");

      const data = await getRouteSheetItems(routeSheetId);

      setItems(data);
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar los recorridos.");
    } finally {
      setLoading(false);
    }
  }, [routeSheetId]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  return {
    items,
    loading,
    error,
    reload: loadItems,
  };
}
