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

export interface DashboardPipeline {
  adminValidation: number;

  envVisit: number;

  delivery: number;

  closed: number;

  rejected: number;
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

  // ============================================================
  // PIPELINE
  // ============================================================

  const pipeline = useMemo<DashboardPipeline>(() => {
    const stats: DashboardPipeline = {
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

        default:
          break;
      }
    });

    return stats;
  }, [sales]);

  // ============================================================
  // METRICS
  // ============================================================

  const metrics = useMemo<DashboardMetrics>(() => {
    const totalSales = sales.length;

    const totalAmount = sales.reduce(
      (acc, sale) => acc + Number(sale.totalAmount || 0),
      0,
    );

    const deliveredSales = sales.filter(
      (sale) => normalizeSaleStatus(sale.status) === "DELIVERED",
    ).length;

    const pendingSales =
      pipeline.adminValidation + pipeline.envVisit + pipeline.delivery;

    const closedSales = pipeline.closed;

    const rejectedSales = pipeline.rejected;

    const averageTicket = totalSales > 0 ? totalAmount / totalSales : 0;

    const completionRate =
      totalSales > 0 ? Math.round((closedSales / totalSales) * 100) : 0;

    const rejectionRate =
      totalSales > 0 ? Math.round((rejectedSales / totalSales) * 100) : 0;

    return {
      totalSales,

      pendingSales,

      deliveredSales,

      closedSales,

      rejectedSales,

      totalAmount,

      averageTicket,

      completionRate,

      rejectionRate,
    };
  }, [sales, pipeline]);

  // ============================================================
  // RECENT SALES
  // ============================================================

  const recentSales = useMemo(() => {
    return [...sales]
      .sort(
        (a, b) =>
          new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime(),
      )
      .slice(0, 5);
  }, [sales]);

  // ============================================================
  // RECENT ACTIVITY
  // ============================================================

  const activities = useMemo<DashboardActivity[]>(() => {
    return [...sales]
      .sort(
        (a, b) =>
          new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime(),
      )
      .slice(0, 8)
      .map((sale) => {
        const status = normalizeSaleStatus(sale.status);

        const clientName = `${sale.client?.name ?? ""} ${
          sale.client?.surname ?? ""
        }`.trim();

        switch (status) {
          case "PENDING_ADMIN_VALIDATION":
            return {
              id: sale.saleId,
              type: "validation",
              title: "Venta pendiente de validación",
              description: clientName || "Cliente sin nombre",
              date: sale.saleDate,
              sale,
            };

          case "PENDING_ENVIRONMENTAL_VISIT":
            return {
              id: sale.saleId,
              type: "visit",
              title: "Pendiente de visita",
              description: clientName || "Cliente sin nombre",
              date: sale.saleDate,
              sale,
            };

          case "PENDING_DELIVERY":
            return {
              id: sale.saleId,
              type: "delivery",
              title: "Lista para entregar",
              description: clientName || "Cliente sin nombre",
              date: sale.saleDate,
              sale,
            };

          case "CLOSED":
            return {
              id: sale.saleId,
              type: "closed",
              title: "Venta cerrada",
              description: clientName || "Cliente sin nombre",
              date: sale.saleDate,
              sale,
            };

          default:
            return {
              id: sale.saleId,
              type: "rejected",
              title: "Venta rechazada",
              description: clientName || "Cliente sin nombre",
              date: sale.saleDate,
              sale,
            };
        }
      });
  }, [sales]);

  // ============================================================
  // RETURN
  // ============================================================

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
