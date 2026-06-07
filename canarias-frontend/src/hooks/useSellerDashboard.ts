"use client";

import { useEffect, useState } from "react";
import { getSellerDashboard } from "@/services/auth.service";

export function useSellerDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await getSellerDashboard();
        setData(res);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return { data, loading };
}
