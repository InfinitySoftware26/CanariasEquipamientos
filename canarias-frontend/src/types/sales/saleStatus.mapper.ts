// src/types/sales/saleStatus.mapper.ts

import { SaleStatus } from "./sale.type";

const statusMap: Record<string, SaleStatus> = {
  pending_admin_validation: "PENDING_ADMIN_VALIDATION",
  pending_environmental_visit: "PENDING_ENVIRONMENTAL_VISIT",
  pending_delivery: "PENDING_DELIVERY",
  delivered: "DELIVERED",
  closed: "CLOSED",
  rejected_admin: "REJECTED_ADMIN",
  environmental_rejected: "ENVIRONMENTAL_REJECTED",
};

export function normalizeSaleStatus(status: string): SaleStatus {
  return statusMap[status] ?? (status.toUpperCase() as SaleStatus);
}
