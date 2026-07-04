import { DailyClosure } from '../entities/daily-closure.entity';
import { DailyClosureStatus } from '../../../common/enums/daily-closure-status.enum';

export interface ClosureFilters {
  status?: DailyClosureStatus;
  closingDate?: string;
}

export interface IClosuresRepository {
  findBySociety(societyId: string, filters?: ClosureFilters): Promise<DailyClosure[]>;
  findByStaff(staffId: string, societyId: string, filters?: ClosureFilters): Promise<DailyClosure[]>;
  findById(id: string): Promise<DailyClosure | null>;
  findByStaffAndDate(staffId: string, closingDate: string): Promise<DailyClosure | null>;
  create(data: Partial<DailyClosure>): Promise<DailyClosure>;
  updateStatus(id: string, status: DailyClosureStatus, validatedBy: string): Promise<void>;
}

export const CLOSURES_REPOSITORY = 'IClosuresRepository';
