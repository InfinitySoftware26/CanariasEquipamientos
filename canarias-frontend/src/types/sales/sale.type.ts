export interface Sale {
  saleId: string;

  clientId: string;

  totalAmount: number;

  installmentsCount: number;

  saleDate: string;

  createdAt: string;
  assignedCollectorId: string | null;

  status:
    | "PENDING_ADMIN_VALIDATION"
    | "PENDING_ENVIRONMENTAL_VISIT"
    | "PENDING_DELIVERY"
    | "DELIVERED"
    | "CLOSED"
    | "REJECTED_ADMIN"
    | "ENVIRONMENTAL_REJECTED";

  // ← preparados para cuando el back los empiece a devolver
  clientName?: string;

  product?: string;

  hasDiscount?: boolean;
}

export type Pipeline = {
  adminValidation: number;
  envVisit: number;
  delivery: number;
  closed: number;
  rejected: number;
};
