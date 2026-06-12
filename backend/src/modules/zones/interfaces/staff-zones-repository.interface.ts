import { StaffZoneStatus } from '../entities/staff-zone.entity';

export interface IStaffZonesRepository {
  findByZone(zoneId: string): Promise<any[]>;
  assign(staffId: string, zoneId: string, status: StaffZoneStatus): Promise<void>;
  unassign(staffId: string, zoneId: string): Promise<void>;
}

export const STAFF_ZONES_REPOSITORY = 'IStaffZonesRepository';
