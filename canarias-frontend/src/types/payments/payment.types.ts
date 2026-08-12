export type PaymentMethod =
  | "cash"
  | "transfer"
  | "debit_card"
  | "credit_card"
  | "mercado_pago"
  | "check";

export interface Payment {
  paymentId: string;

  societyId: string;

  clientId: string;

  saleId: string;

  staffId: string;

  routeSheetItemId?: string | null;

  amount: number;

  method: PaymentMethod;

  paymentDate: string;

  notes?: string;

  createdAt: string;

  updatedAt: string;
}

export interface CreatePaymentPayload {
  saleId: string;

  clientId: string;

  amount: number;

  method: PaymentMethod;

  installmentId?: string;

  notes?: string;
}

export interface PaymentApplication {
  installmentId: string;

  installmentNumber: number;

  amountApplied: number;
}

export interface ApplyPaymentPayload {
  applications: {
    installmentId: string;
    amount: number;
  }[];
}

export interface PaymentFilters {
  saleId?: string;
  clientId?: string;
  staffId?: string;
  from?: string;
  to?: string;
}

export interface PaymentStats {
  totalPayments: number;
  totalCollected: number;
  cashPayments: number;
  transferPayments: number;
}
