export type PaymentFrequency = "weekly" | "monthly";

export interface CreateSalePayload {
  clientId: string;

  saleDate: string;

  installmentsCount: number;

  paymentFrequency: PaymentFrequency;

  firstDueDate: string;

  observation?: string;

  products: {
    productId: string;
    quantity: number;
    unitPrice: number;
  }[];
}
