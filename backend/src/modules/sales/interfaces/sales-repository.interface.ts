import { Sale } from '../entities/sale.entity';
import { SaleStatus } from '../../../common/enums/sale-status.enum';

export interface ISalesRepository {
  findById(id: string): Promise<Sale | null>;
  findByClient(clientId: string, societyId: string): Promise<Sale[]>;
  findBySociety(societyId: string): Promise<Sale[]>;
  findByStatus(societyId: string, status: SaleStatus): Promise<Sale[]>;
  findPendingValidation(societyId: string): Promise<Sale[]>;
  findBySeller(staffId: string, societyId: string): Promise<Sale[]>;
  findByCollector(collectorId: string, societyId: string): Promise<Sale[]>;
  findActiveByClient(clientId: string): Promise<Sale[]>;
  create(data: Partial<Sale>): Promise<Sale>;
  update(id: string, data: Partial<Sale>): Promise<void>;
  updateStatus(id: string, status: SaleStatus): Promise<void>;
}

export const SALES_REPOSITORY = 'ISalesRepository';
