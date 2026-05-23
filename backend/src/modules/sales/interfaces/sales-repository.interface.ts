import { Sale } from '../entities/sale.entity';
import { SaleStatus } from '../../../common/enums/sale-status.enum';
import { QueryRunner } from 'typeorm';

export interface ISalesRepository {
  findById(id: string): Promise<Sale | null>;
  findByClient(clientId: string, societyId: string): Promise<Sale[]>;
  findPendingValidation(societyId: string): Promise<Sale[]>;
  findActiveByClient(clientId: string): Promise<Sale[]>;
  create(data: Partial<Sale>, qr?: QueryRunner): Promise<Sale>;
  updateStatus(id: string, status: SaleStatus, qr?: QueryRunner): Promise<void>;
}

export const SALES_REPOSITORY = 'ISalesRepository';
