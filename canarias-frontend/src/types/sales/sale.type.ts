export interface SaleClient {
  clientId: string;
  name: string;
  surname: string;
  documentNumber?: string;
  address?: string;
  phone?: string;
  email?: string | null;

  societyId?: string;

  createdBy?: string;
  updatedBy?: string;

  createdAt?: string;
  updatedAt?: string;
}

export interface SaleStaff {
  staffId: string;
  name: string;
  surname?: string;
  email?: string;
  role?: string;
}

export interface SaleProductDetail {
  saleProductId: string;

  saleId: string;

  productId: string;

  quantity: number;

  unitPrice: string;

  subtotal: string;

  product?: {
    productId: string;

    name: string;

    brand?: string;

    model?: string;

    category?: string;

    description?: string | null;

    price?: string;

    costPrice?: string;

    status?: string;
  };
}

export interface Sale {
  saleId: string;

  // CLIENTE
  clientId: string;

  client?: SaleClient;

  // VENDEDOR
  staffId: string;

  staff?: SaleStaff;

  societyId: string;

  // IMPORTES
  totalAmount: string;

  sellerCommissionRate: string;

  sellerCommission: string;

  installmentAmount: string;

  installmentsCount: number;

  paymentFrequency: string;

  // FECHAS
  firstDueDate?: string | null;

  saleDate: string;

  observation?: string | null;

  hasDiscount?: boolean;

  createdAt?: string;

  updatedAt?: string;

  deliveryDate?: string | null;
  

  // ESTADO
  status:
    | "pending_admin_validation"
    | "pending_environmental_visit"
    | "pending_delivery"
    | "delivered"
    | "closed"
    | "rejected_admin"
    | "environmental_rejected";

  assignedCollectorId?: string | null;

  products?: SaleProductDetail[];
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
