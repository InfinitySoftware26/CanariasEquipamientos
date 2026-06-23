import { StaffRole } from "@/types/auth.types";

export const salePermissions = {
  [StaffRole.SUPER_ADMIN]: {
    canViewSale: true,
    canValidateSale: true,
    canAssignCollector: true,
    canManageCollection: true,
  },

  [StaffRole.MANAGER]: {
    canViewSale: true,
    canValidateSale: false,
    canAssignCollector: false,
    canManageCollection: false,
  },

  [StaffRole.ADMIN]: {
    canViewSale: true,
    canValidateSale: true,
    canAssignCollector: true,
    canManageCollection: false,
  },

  [StaffRole.SELLER]: {
    canViewSale: true,
    canValidateSale: false,
    canAssignCollector: false,
    canManageCollection: false,
  },

  [StaffRole.COLLECTOR]: {
    canViewSale: true,
    canValidateSale: false,
    canAssignCollector: false,
    canManageCollection: true,
    canValidateEnvironmentalVisit: true,
  },
};
