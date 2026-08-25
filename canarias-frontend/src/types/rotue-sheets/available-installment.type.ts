export interface AvailableRouteInstallment {
  installmentId: string;
  installmentNumber: number;
  amount: number;
  paidAmount: number;
  dueDate: string;
  status: string;

  clientId: string;
  clientName: string;
  clientDocumentNumber?: string | null;
  clientAddress?: string | null;
  clientPhone?: string | null;

  saleId: string;

  sale?: {
    saleId: string;
    totalAmount: number;
    installmentAmount: number;
    installmentsCount: number;
    paymentFrequency: string;

    products: {
      saleProductId: string;
      productId: string;
      quantity: number;
      unitPrice: number;
      subtotal: number;

      product?: {
        name: string;
        brand?: string | null;
        model?: string | null;
      } | null;
    }[];
  } | null;
}
