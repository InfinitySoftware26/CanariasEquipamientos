import { useEffect, useState } from "react";
import { SellerDashboardKpis } from "@/types/sellerDashboardKpis.types";

export function useSellerKpis() {
  const [data, setData] = useState<SellerDashboardKpis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/dashboard"); // tu endpoint real
      const json = await res.json();

      setData(json);
      setLoading(false);
    }

    load();
  }, []);

  return { data, loading };
}
