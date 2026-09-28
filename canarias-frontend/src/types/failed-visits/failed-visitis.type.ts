export type FailedVisitReason =
  | "client_absent"
  | "refused_payment"
  | "wrong_address"
  | "other";

export type FailedVisitStatus = "pending" | "rescheduled" | "resolved";

export interface FailedVisit {
  failedVisitId: string;
  clientId: string;
  saleId: string;
  routeSheetItemId: string;

  reason: FailedVisitReason;

  notes?: string | null;

  attemptNumber?: number;

  registeredAt?: string;

  rescheduledDate?: string | null;
}

export interface FailedVisitFilters {
  clientId?: string;
  collectorId?: string;
  status?: FailedVisitStatus;
  from?: string;
  to?: string;
}

export interface RescheduleFailedVisitPayload {
  rescheduledDate: string;
  notes?: string;
}
