export interface CreateSalePayload {
  clientId: string;

  paymentType: string;

  totalAmount: number;

  saleDate: string;

  observation?: string;

  products: {
    productId: string;
    quantity: number;
  }[];
}
