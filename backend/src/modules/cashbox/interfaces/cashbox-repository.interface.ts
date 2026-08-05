import { Cashbox } from '../entities/cashbox.entity';
import { CashboxStatus } from '../../../common/enums/cashbox-status.enum';

export interface ICashboxRepository {
  create(data: Partial<Cashbox>): Promise<Cashbox>;
  findById(id: string): Promise<Cashbox | null>;
  findBySociety(societyId: string): Promise<Cashbox[]>;
  findOpenForSociety(societyId: string): Promise<Cashbox | null>;
  updateStatus(id: string, status: CashboxStatus, closingBalance?: number): Promise<void>;
}

export const CASHBOX_REPOSITORY = 'ICashboxRepository';
