"use client";

import { useState } from "react";

import { CreateZonePayload, Zone } from "@/types/zones/zone.type";

import { createZone } from "@/services/zones/zone.service";

export function useCreateZone() {
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  async function create(payload: CreateZonePayload): Promise<Zone | null> {
    try {
      setLoading(true);
      setError(null);

      const data = await createZone(payload);

      return data;
    } catch (err) {
      console.error(err);

      setError("No se pudo crear la zona");

      return null;
    } finally {
      setLoading(false);
    }
  }

  return {
    create,
    loading,
    error,
  };
}
