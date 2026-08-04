export type PaymentFrequency = "weekly" | "monthly";

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
