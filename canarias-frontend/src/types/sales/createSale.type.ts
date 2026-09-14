export type PaymentFrequency = "weekly" | "monthly" | "biweekly" | "daily";

export interface CreateSalePayload {
  clientId: string;
  financingPlanId?: string;
  promotionId?: string;
  financingConfigId?: string;
  financingRate?: number;
  installmentsCount: number;
  paymentFrequency: PaymentFrequency;
  observation?: string;
  products: {
    productId: string;
    quantity: number;
    unitPrice: number;
  }[];
}
