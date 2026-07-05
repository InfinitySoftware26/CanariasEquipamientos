import { RouteSheetItem } from '../entities/route-sheet-item.entity';
import { RouteSheetItemResult } from '../../../common/enums/route-sheet-item-result.enum';

export interface IRouteSheetItemsRepository {
  findByRouteSheet(routeSheetId: string): Promise<RouteSheetItem[]>;
  findById(id: string): Promise<RouteSheetItem | null>;
  createMany(data: Partial<RouteSheetItem>[]): Promise<RouteSheetItem[]>;
  updateResult(
    id: string,
    result: RouteSheetItemResult,
    collectedAmount?: number,
    notes?: string,
  ): Promise<void>;
}

export const ROUTE_SHEET_ITEMS_REPOSITORY = 'IRouteSheetItemsRepository';
