"use client";

import { useState } from "react";

export function useReportDownload() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const download = async (action: () => Promise<void>) => {
    try {
      setLoading(true);
      setError(null);

      await action();
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error ? err.message : "No se pudo descargar el reporte",
      );
    } finally {
      setLoading(false);
    }
  };

  return {
    download,
    loading,
    error,
  };
}
