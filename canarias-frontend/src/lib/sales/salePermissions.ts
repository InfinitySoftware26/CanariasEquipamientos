import { StaffRole } from "@/types/auth.types";

export const salePermissions = {
  [StaffRole.SUPER_ADMIN]: {
    // Acciones
    canViewSale: true,
    canValidateSale: true,
    canAssignCollector: true,
    canManageCollection: true,
    canValidateEnvironmentalVisit: true,

    // Información
    canViewOwnCommission: true,
    canViewSellerCommission: true,
    canViewSellerData: true,
    canViewSaleAmount: true,
  },

  [StaffRole.MANAGER]: {
    // Acciones
    canViewSale: true,
    canValidateSale: false,
    canAssignCollector: false,
    canManageCollection: false,
    canValidateEnvironmentalVisit: false,

    // Información
    canViewOwnCommission: false,
    canViewSellerCommission: true,
    canViewSellerData: true,
    canViewSaleAmount: true,
  },

  [StaffRole.ADMIN]: {
    // Acciones
    canViewSale: true,
    canValidateSale: true,
    canAssignCollector: true,
    canManageCollection: false,
    canValidateEnvironmentalVisit: false,

    // Información
    canViewOwnCommission: false,
    canViewSellerCommission: true,
    canViewSellerData: true,
    canViewSaleAmount: true,
  },

  [StaffRole.SELLER]: {
    // Acciones
    canViewSale: true,
    canValidateSale: false,
    canAssignCollector: false,
    canManageCollection: false,
    canValidateEnvironmentalVisit: false,

    // Información
    canViewOwnCommission: true,
    canViewSellerCommission: false,
    canViewSellerData: false,
    canViewSaleAmount: false,
  },

  [StaffRole.COLLECTOR]: {
    // Acciones
    canViewSale: true,
    canValidateSale: false,
    canAssignCollector: false,
    canManageCollection: true,
    canValidateEnvironmentalVisit: true,

    // Información
    canViewOwnCommission: false,
    canViewSellerCommission: false,
    canViewSellerData: false,
    canViewSaleAmount: false,
  },
};
