"use client";

import { useState } from "react";

import { updateRouteSheetItem } from "@/services/route-sheets/routeSheetsItems.service";

import { UpdateRouteSheetItemPayload } from "@/types/rotue-sheets/updateRouteSheets";

export function useUpdateRouteSheetItem() {
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  async function update(itemId: string, payload: UpdateRouteSheetItemPayload) {
    try {
      setLoading(true);
      setError("");

      await updateRouteSheetItem(itemId, payload);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error ? err.message : "Error actualizando visita",
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
