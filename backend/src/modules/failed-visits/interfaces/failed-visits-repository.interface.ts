import { FailedVisit } from '../entities/failed-visit.entity';

export interface IFailedVisitsRepository {
  create(data: Partial<FailedVisit>): Promise<FailedVisit>;
  findById(id: string): Promise<FailedVisit | null>;
  findByRouteSheetItem(routeSheetItemId: string): Promise<FailedVisit[]>;
  findBySociety(societyId: string): Promise<FailedVisit[]>;
  countByRouteSheetItem(routeSheetItemId: string): Promise<number>;
  updateReschedule(id: string, rescheduledDate: string): Promise<void>;
}

export const FAILED_VISITS_REPOSITORY = 'IFailedVisitsRepository';
