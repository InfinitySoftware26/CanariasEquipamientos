import { RouteSheet } from '../entities/route-sheet.entity';
import { RouteSheetStatus } from '../../../common/enums/route-sheet-status.enum';

export interface RouteSheetFilters {
  zoneId?: string;
  staffId?: string;
  status?: RouteSheetStatus;
  routeDate?: string;
}

export interface IRouteSheetsRepository {
  findBySociety(societyId: string, filters?: RouteSheetFilters): Promise<RouteSheet[]>;
  findByStaff(staffId: string, societyId: string, filters?: RouteSheetFilters): Promise<RouteSheet[]>;
  findById(id: string): Promise<RouteSheet | null>;
  findActiveForStaffZoneDate(staffId: string, zoneId: string, routeDate: string): Promise<RouteSheet | null>;
  create(data: Partial<RouteSheet>): Promise<RouteSheet>;
  updateStatus(id: string, status: RouteSheetStatus): Promise<void>;
}

export const ROUTE_SHEETS_REPOSITORY = 'IRouteSheetsRepository';
