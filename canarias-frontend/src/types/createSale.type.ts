export type PaymentFrequency = "weekly" | "monthly";

export interface CreateSalePayload {
  clientId: string;

  saleDate: string;

  installmentsCount: 3 | 6 | 9;

  paymentFrequency: PaymentFrequency;

  firstDueDate: string;

  observation?: string;

  products: {
    productId: string;
    quantity: number;
  }[];
}
