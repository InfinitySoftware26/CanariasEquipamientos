export interface FailedVisit {
  id: string;
  clientId: string;
  saleId: string;
  collectorId: string;
  reason: string;
  observations?: string;
  date: string;
  status: string;
  rescheduledDate?: string;
}
