export interface Sale {
  saleId: string;

  clientId: string;
  client?: {
    clientId: string;
    name: string;
    surname: string;
  };

  staffId: string;
  societyId: string;

  totalAmount: number;
  installmentAmount: number;
  installmentsCount: number;
  observation: string;

  paymentFrequency: string;

  firstDueDate: string;
  saleDate: string;
  hasDiscount?: boolean;
  createdAt?: number;
  status:
    | "pending_admin_validation"
    | "pending_environmental_visit"
    | "pending_delivery"
    | "delivered"
    | "closed"
    | "rejected_admin"
    | "environmental_rejected";

  // ← preparados para cuando el back los empiece a devolver
  products?: {
    saleProductId: string;
    productId: string;
    product?: {
      productId: string;
      name: string;
    };
  }[];

  assignedCollectorId?: string | null;
}

export type Pipeline = {
  adminValidation: number;
  envVisit: number;
  delivery: number;
  closed: number;
  rejected: number;
};

export type SaleStatus =
  | "PENDING_ADMIN_VALIDATION"
  | "PENDING_ENVIRONMENTAL_VISIT"
  | "PENDING_DELIVERY"
  | "DELIVERED"
  | "CLOSED"
  | "REJECTED_ADMIN"
  | "ENVIRONMENTAL_REJECTED";

export type SalesResponse = {
  data: Sale[];
  statusCode: number;
  timestamp: string;
};
