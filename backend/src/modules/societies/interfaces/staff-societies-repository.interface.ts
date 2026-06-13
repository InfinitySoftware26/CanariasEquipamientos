import { StaffSocietyStatus } from '../entities/staff-society.entity';

export interface IStaffSocietiesRepository {
  findBySocietyWithStaff(societyId: string): Promise<any[]>;
  findByStaff(staffId: string): Promise<{ societyId: string; societyName: string; status: string }[]>;
  upsert(staffId: string, societyId: string, status: StaffSocietyStatus): Promise<void>;
}

export const STAFF_SOCIETIES_REPOSITORY = 'IStaffSocietiesRepository';
