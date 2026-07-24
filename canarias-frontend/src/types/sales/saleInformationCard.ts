export interface SaleHistorySnapshot {
  previousStatus?: string;
  newStatus?: string;
  observations?: string;

  previousCollectorId?: string | null;
  newCollectorId?: string | null;

  saleId?: string;
  clientId?: string;
  totalAmount?: number;
}

export interface SaleHistoryItem {
  id: string;
  saleId: string;
  action: string;
  snapshot: SaleHistorySnapshot;
  performedBy: string;
  performedByName: string;
  performedAt: string;
}
