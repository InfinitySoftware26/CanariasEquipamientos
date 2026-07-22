"use client";

import { Sale } from "@/types/sales/sale.type";

import { useRolePermissions } from "@/hooks/auth/useRolePermissions";

import { AdminSalePanel } from "./details/AdminSalePanel";
import { CollectorSalePanel } from "./details/CollectorAssingPanel";

interface Props {
  sale: Sale;
  onRefresh: () => void | Promise<void>;
}

export function SaleWorkflow({ sale, onRefresh }: Props) {
  const { canManageCollection, canValidateSale } = useRolePermissions();

  if (canManageCollection) {
    return <CollectorSalePanel sale={sale} onRefresh={onRefresh} />;
  }

  if (canValidateSale) {
    return <AdminSalePanel sale={sale} onRefresh={onRefresh} />;
  }

  return null;
}
