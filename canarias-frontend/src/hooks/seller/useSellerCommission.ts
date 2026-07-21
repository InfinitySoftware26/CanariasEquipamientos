"use client";

import { useMemo } from "react";
import { useSellerSales } from "@/hooks/seller/useSellerSale";

export function useSellerCommissions() {
  const { sales, loading, error } = useSellerSales();

  const data = useMemo(() => {
    const closedSales = sales.filter(
      (sale) => sale.status.toLowerCase() === "closed",
    );

    const now = new Date();

    const monthlySales = closedSales.filter((sale) => {
      const date = new Date(sale.saleDate);

      return (
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );
    });

    const monthlyCommission = monthlySales.reduce(
      (acc, sale) => acc + Number(sale.sellerCommission),
      0,
    );

    const totalCommission = closedSales.reduce(
      (acc, sale) => acc + Number(sale.sellerCommission),
      0,
    );

    const averageCommission =
      closedSales.length > 0 ? totalCommission / closedSales.length : 0;

    const monthlyHistory = Array.from({ length: 12 }, (_, month) => ({
      month,
      total: closedSales
        .filter((sale) => {
          const d = new Date(sale.saleDate);

          return (
            d.getMonth() === month && d.getFullYear() === now.getFullYear()
          );
        })
        .reduce((acc, sale) => acc + Number(sale.sellerCommission), 0),
    }));

    return {
      closedSales,
      monthlyCommission,
      totalCommission,
      averageCommission,
      monthlyHistory,
    };
  }, [sales]);

  return {
    ...data,
    loading,
    error,
  };
}
