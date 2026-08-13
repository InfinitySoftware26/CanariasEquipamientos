export type FailedVisitReason =
  | "client_absent"
  | "refused_payment"
  | "wrong_address"
  | "other";

export interface FailedVisit {
  failedVisitId: string;
  clientId: string;
  routeSheetItemId: string;
  reason: FailedVisitReason;
  notes?: string | null;
  attemptNumber?: number;
  registeredAt?: string;
  rescheduledDate?: string | null;
}
