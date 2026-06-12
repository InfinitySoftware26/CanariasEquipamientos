import { StaffSocietyStatus } from '../entities/staff-society.entity';

export interface IStaffSocietiesRepository {
  findBySocietyWithStaff(societyId: string): Promise<any[]>;
  upsert(staffId: string, societyId: string, status: StaffSocietyStatus): Promise<void>;
}

export const STAFF_SOCIETIES_REPOSITORY = 'IStaffSocietiesRepository';
