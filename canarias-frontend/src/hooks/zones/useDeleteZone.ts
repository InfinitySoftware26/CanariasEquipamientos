"use client";

import { useState } from "react";

import { deleteZone } from "@/services/zones/zone.service";

export function useDeleteZone() {
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  async function remove(id: string) {
    try {
      setLoading(true);
      setError(null);

      await deleteZone(id);

      return true;
    } catch (err) {
      console.error(err);

      setError("No se pudo eliminar la zona");

      return false;
    } finally {
      setLoading(false);
    }
  }

  return {
    remove,
    loading,
    error,
  };
}
