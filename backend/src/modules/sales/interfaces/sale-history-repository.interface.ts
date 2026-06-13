import { SaleHistory } from '../entities/sale-history.entity';

export interface ISaleHistoryRepository {
  create(data: {
    saleId: string;
    action: string;
    snapshot: object;
    performedBy: string;
    performedByName: string;
  }): Promise<SaleHistory>;
  findBySale(saleId: string): Promise<SaleHistory[]>;
}

export const SALE_HISTORY_REPOSITORY = 'ISaleHistoryRepository';
