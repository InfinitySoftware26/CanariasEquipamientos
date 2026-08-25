export type InstallmentStatus =
  | "Pendiente"
  | "Pagado"
  | "Atrasada"
  | "Pago Parcial"
  | "Impaga";

export interface Installment {
  installmentId: string;

  saleId: string;

  clientId: string;

  societyId: string;

  installmentNumber: number;

  amount: number;

  paidAmount: number;

  remainingAmount: number;

  dueDate: string;

  status: InstallmentStatus;

  notes?: string | null;

  createdAt: string;

  updatedAt: string;
}

export interface PayInstallmentPayload {
  amount: number;
}
