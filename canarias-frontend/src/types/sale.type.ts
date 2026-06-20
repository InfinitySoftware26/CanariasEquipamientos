export interface Sale {
  saleId: string;

  clientId: string;

  totalAmount: number;

  installmentsCount: number;

  saleDate: string;

  status:
    | "PENDING_ADMIN_VALIDATION"
    | "PENDING_ENVIRONMENTAL_VISIT"
    | "PENDING_DELIVERY"
    | "DELIVERED"
    | "CLOSED";

  createdAt: string;
}
