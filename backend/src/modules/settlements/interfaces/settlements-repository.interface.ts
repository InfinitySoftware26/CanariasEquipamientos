import { Settlement } from '../entities/settlement.entity';
import { SettlementStatus } from '../../../common/enums/settlement-status.enum';

export interface SettlementFilters {
  status?: SettlementStatus;
  staffId?: string;
}

export interface ISettlementsRepository {
  findBySociety(societyId: string, filters?: SettlementFilters): Promise<Settlement[]>;
  findById(id: string): Promise<Settlement | null>;
  findByClosure(closureId: string): Promise<Settlement | null>;
  create(data: Partial<Settlement>): Promise<Settlement>;
  updateStatus(id: string, status: SettlementStatus): Promise<void>;
}

export const SETTLEMENTS_REPOSITORY = 'ISettlementsRepository';
