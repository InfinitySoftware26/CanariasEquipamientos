"use client";

import { useCallback, useEffect, useState } from "react";

import {
  getFinancingConfig,
  updateFinancingConfig,
} from "@/services/financing/financing.service";
import {
  FinancingConfig,
  UpdateFinancingPayload,
} from "@/types/financing/financing.types";

export function useFinancingConfig() {
  const [config, setConfig] = useState<FinancingConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const loadConfig = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getFinancingConfig();

      setConfig(data);
    } catch (err) {
      console.error(err);

      setConfig(null);

      setError(
        err instanceof Error
          ? err.message
          : "No se pudo cargar la configuración de financiación",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  const save = async (payload: UpdateFinancingPayload) => {
    try {
      setSaving(true);

      const updated = await updateFinancingConfig(payload);

      setConfig(updated);

      return updated;
    } finally {
      setSaving(false);
    }
  };

  return {
    config,
    loading,
    error,
    refresh: loadConfig,
    save,
    saving,
  };
}
