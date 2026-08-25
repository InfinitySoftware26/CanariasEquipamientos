export type SettlementStatus = "Pendiente" | "Validada" | "Rechazada";

export interface Settlement {
  settlementId: string;

  closureId: string;

  staffId: string;

  societyId: string;

  settlementDate: string;

  amountDue: number;

  amountCollected: number;

  outstandingDebt: number;

  status: SettlementStatus;

  notes?: string | null;

  createdAt: string;

  updatedAt: string;
}

export interface SettlementFilters {
  status?: SettlementStatus;
  staffId?: string;
}

export interface CreateSettlementPayload {
  closureId: string;
}

export interface ValidateSettlementPayload {
  status: "validated" | "rejected";
  observations?: string;
}
