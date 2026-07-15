"use client";

import { useState } from "react";

import { assignStaff } from "@/services/zones/zone.service";

export function useAssignStaff() {
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  async function assign(zoneId: string, staffId: string) {
    try {
      setLoading(true);

      setError("");

      await assignStaff(zoneId, {
        staffId,
      });

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");

      return false;
    } finally {
      setLoading(false);
    }
  }

  return {
    assign,
    loading,
    error,
  };
}
