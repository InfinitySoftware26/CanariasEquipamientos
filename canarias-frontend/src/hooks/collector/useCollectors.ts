"use client";

import { useCallback, useEffect, useState } from "react";

import { getCollectors } from "@/services/collectors/collectors.services";
import { User } from "@/types/auth.types";

export function useCollectors() {
  const [collectors, setCollectors] = useState<User[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getCollectors();

      setCollectors(data);
    } catch (err) {
      console.error(err);

      setError("No se pudieron cargar los cobradores");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return {
    collectors,
    loading,
    error,
    reload,
  };
}
