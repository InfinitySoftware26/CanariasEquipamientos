"use client";

import { useCallback, useEffect, useState } from "react";

import { Zone } from "@/types/zones/zone.type";
import { getZones } from "@/services/zones/zone.service";

export function useZones() {
  const [zones, setZones] = useState<Zone[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getZones();
      console.log("ZONES RESPONSE:", data);

      setZones(data ?? []);
    } catch (err) {
      console.error(err);

      setError("No se pudieron cargar las zonas");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return {
    zones,
    loading,
    error,
    reload,
  };
}
