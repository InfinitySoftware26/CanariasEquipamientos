"use client";

import { StaffRole } from "@/types/auth.types";
import { useAuthStore } from "@/store/auth.store";

export function useRolePermissions() {
  const role = useAuthStore((state) => state.activeRole);
  console.log("ROLE:", role);
  if (!role) {
    return {
      canViewSale: false,
      canValidateSale: false,
      canAssignCollector: false,
      canManageCollection: false,
      canValidateEnvironmentalVisit: false,
    };
  }

  return {
    canViewSale: true,

    canValidateSale:
      role === StaffRole.ADMIN ||
      role === StaffRole.MANAGER ||
      role === StaffRole.SUPER_ADMIN,

    canAssignCollector:
      role === StaffRole.ADMIN ||
      role === StaffRole.MANAGER ||
      role === StaffRole.SUPER_ADMIN,

    canManageCollection: role === StaffRole.COLLECTOR,

    canValidateEnvironmentalVisit: role === StaffRole.COLLECTOR,
  };
}
