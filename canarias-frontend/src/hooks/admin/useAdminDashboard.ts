"use client";

import { useMemo } from "react";

import { useSales } from "../sales/useSale";
import { Sale } from "@/types/sales/sale.type";
import { normalizeSaleStatus } from "@/types/sales/saleStatus.mapper";

export interface DashboardMetrics {
  totalSales: number;
  pendingSales: number;
  deliveredSales: number;
  closedSales: number;
  rejectedSales: number;

  totalAmount: number;
  averageTicket: number;

  completionRate: number;
  rejectionRate: number;
}

export interface DashboardActivity {
  id: string;
  type: "validation" | "visit" | "delivery" | "closed" | "rejected";

  title: string;

  description: string;

  date: string;

  sale: Sale;
}

export function useAdminDashboard() {
  const { sales, loading, error, refresh } = useSales();

  const pipeline = useMemo(() => {
    const stats = {
      adminValidation: 0,
      envVisit: 0,
      delivery: 0,
      closed: 0,
      rejected: 0,
    };

    sales.forEach((sale) => {
      const status = normalizeSaleStatus(sale.status);

      switch (status) {
        case "PENDING_ADMIN_VALIDATION":
          stats.adminValidation++;
          break;

        case "PENDING_ENVIRONMENTAL_VISIT":
          stats.envVisit++;
          break;

        case "PENDING_DELIVERY":
          stats.delivery++;
          break;

        case "CLOSED":
          stats.closed++;
          break;

        case "REJECTED_ADMIN":
        case "ENVIRONMENTAL_REJECTED":
          stats.rejected++;
          break;
      }
    });

    return stats;
  }, [sales]);

  const metrics = useMemo<DashboardMetrics>(() => {
    const totalAmount = sales.reduce(
      (acc, sale) => acc + Number(sale.totalAmount),
      0,
    );

    const deliveredSales = sales.filter(
      (sale) => normalizeSaleStatus(sale.status) === "DELIVERED",
    ).length;

    const pendingSales =
      pipeline.adminValidation + pipeline.envVisit + pipeline.delivery;

    const completionRate =
      sales.length === 0
        ? 0
        : Math.round((pipeline.closed / sales.length) * 100);

    const rejectionRate =
      sales.length === 0
        ? 0
        : Math.round((pipeline.rejected / sales.length) * 100);

    return {
      totalSales: sales.length,

      pendingSales,

      deliveredSales,

      closedSales: pipeline.closed,

      rejectedSales: pipeline.rejected,

      totalAmount,

      averageTicket: sales.length > 0 ? totalAmount / sales.length : 0,

      completionRate,

      rejectionRate,
    };
  }, [sales, pipeline]);

  const recentSales = useMemo(() => {
    return [...sales]
      .sort(
        (a, b) =>
          new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime(),
      )
      .slice(0, 5);
  }, [sales]);

  const activities = useMemo<DashboardActivity[]>(() => {
    return [...sales]
      .sort(
        (a, b) =>
          new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime(),
      )
      .slice(0, 8)
      .map((sale) => {
        const status = normalizeSaleStatus(sale.status);

        switch (status) {
          case "PENDING_ADMIN_VALIDATION":
            return {
              id: sale.saleId,
              type: "validation",
              title: "Venta pendiente de validación",
              description: `${sale.client?.name ?? ""} ${sale.client?.surname ?? ""}`,
              date: sale.saleDate,
              sale,
            };

          case "PENDING_ENVIRONMENTAL_VISIT":
            return {
              id: sale.saleId,
              type: "visit",
              title: "Pendiente de visita",
              description: `${sale.client?.name ?? ""} ${sale.client?.surname ?? ""}`,
              date: sale.saleDate,
              sale,
            };

          case "PENDING_DELIVERY":
            return {
              id: sale.saleId,
              type: "delivery",
              title: "Lista para entregar",
              description: `${sale.client?.name ?? ""} ${sale.client?.surname ?? ""}`,
              date: sale.saleDate,
              sale,
            };

          case "CLOSED":
            return {
              id: sale.saleId,
              type: "closed",
              title: "Venta cerrada",
              description: `${sale.client?.name ?? ""} ${sale.client?.surname ?? ""}`,
              date: sale.saleDate,
              sale,
            };

          default:
            return {
              id: sale.saleId,
              type: "rejected",
              title: "Venta rechazada",
              description: `${sale.client?.name ?? ""} ${sale.client?.surname ?? ""}`,
              date: sale.saleDate,
              sale,
            };
        }
      });
  }, [sales]);

  return {
    loading,
    error,

    sales,

    pipeline,

    metrics,

    recentSales,

    activities,

    refresh,
  };
}
