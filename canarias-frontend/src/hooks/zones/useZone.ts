"use client";

import { useCallback, useEffect, useState } from "react";

import { Zone } from "@/types/zones/zone.type";
import { getZone } from "@/services/zones/zone.service";

export function useZone(id?: string) {
  const [zone, setZone] = useState<Zone | null>(null);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!id) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data = await getZone(id);
      console.log("ZONE RESPONSE", data);

      setZone(data);
    } catch (err) {
      console.error(err);

      setError("No se pudo cargar la zona");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    reload();
  }, [reload]);

  return {
    zone,
    loading,
    error,
    reload,
  };
}
