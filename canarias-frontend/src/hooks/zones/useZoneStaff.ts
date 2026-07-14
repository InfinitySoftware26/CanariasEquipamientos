"use client";

import { useCallback, useEffect, useState } from "react";

import { ZoneStaff } from "@/types/zones/staff-zone.type";

import {
  assignStaff,
  getZoneStaff,
  unassignStaff,
} from "@/services/zones/zone.service";

export function useZoneStaff(zoneId?: string) {
  const [staff, setStaff] = useState<ZoneStaff[]>([]);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!zoneId) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data = await getZoneStaff(zoneId);

      setStaff(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);

      setError("No se pudo cargar el personal");
    } finally {
      setLoading(false);
    }
  }, [zoneId]);

  useEffect(() => {
    reload();
  }, [reload]);

  async function assign(staffId: string) {
    if (!zoneId) return;

    await assignStaff(zoneId, {
      staffId,
    });

    await reload();
  }

  async function remove(staffId: string) {
    if (!zoneId) return;

    await unassignStaff(zoneId, staffId);

    await reload();
  }

  return {
    staff,
    loading,
    error,
    assign,
    remove,
    reload,
  };
}
