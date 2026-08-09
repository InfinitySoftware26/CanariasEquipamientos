export type PaymentFrequency = "weekly" | "monthly" | "biweekly" | "daily";

export interface CreateSalePayload {
  clientId: string;

  installmentsCount: number;

  paymentFrequency: PaymentFrequency;

  observation?: string;

  products: {
    productId: string;
    quantity: number;
    unitPrice: number;
  }[];
}
