"use client";

import { useState } from "react";
import { deactivateStaff } from "@/services/staff.service";

interface UseDeactivateStaffProps {
  onSuccess?: () => Promise<void> | void;
}

export function useDeactivateStaff({
  onSuccess,
}: UseDeactivateStaffProps = {}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDeactivate(id: string) {
    try {
      setLoading(true);
      setError(null);

      await deactivateStaff(id);

      if (onSuccess) {
        await onSuccess();
      }
    } catch (err) {
      console.error(err);
      setError("No se pudo desactivar el empleado.");
    } finally {
      setLoading(false);
    }
  }

  return {
    loading,
    error,
    handleDeactivate,
  };
}
