import { Settlement } from '../entities/settlement.entity';
import { SettlementStatus } from '../../../common/enums/settlement-status.enum';

export interface SettlementFilters {
  status?: SettlementStatus;
  staffId?: string;
}

export interface ISettlementsRepository {
  findBySociety(societyId: string, filters?: SettlementFilters): Promise<Settlement[]>;
  /** societyId opcional: si se pasa, filtra por sociedad en la consulta. */
  findById(id: string, societyId?: string): Promise<Settlement | null>;
  findByClosure(closureId: string): Promise<Settlement | null>;
  create(data: Partial<Settlement>): Promise<Settlement>;
  updateStatus(id: string, status: SettlementStatus): Promise<void>;
}

export const SETTLEMENTS_REPOSITORY = 'ISettlementsRepository';
