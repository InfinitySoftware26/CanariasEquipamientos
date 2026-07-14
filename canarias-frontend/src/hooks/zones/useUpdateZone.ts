"use client";

import { useState } from "react";

import { UpdateZonePayload, Zone } from "@/types/zones/zone.type";

import { updateZone } from "@/services/zones/zone.service";

export function useUpdateZone() {
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  async function update(
    id: string,
    payload: UpdateZonePayload,
  ): Promise<Zone | null> {
    try {
      setLoading(true);
      setError(null);

      const data = await updateZone(id, payload);

      return data;
    } catch (err) {
      console.error(err);

      setError("No se pudo actualizar la zona");

      return null;
    } finally {
      setLoading(false);
    }
  }

  return {
    update,
    loading,
    error,
  };
}
