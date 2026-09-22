import { RouteSheetItem } from "../entities/route-sheet-item.entity";

import { RouteSheetItemResult } from "../../../common/enums/route-sheet-item-result.enum";

export const ROUTE_SHEET_ITEMS_REPOSITORY = "ROUTE_SHEET_ITEMS_REPOSITORY";

export interface IRouteSheetItemsRepository {
  createMany(items: Partial<RouteSheetItem>[]): Promise<RouteSheetItem[]>;

  findByRouteSheet(routeSheetId: string): Promise<RouteSheetItem[]>;

  findById(id: string): Promise<RouteSheetItem | null>;

  findActiveByInstallment(
    installmentId: string,
  ): Promise<RouteSheetItem | null>;

  findActiveDeliveryBySale(saleId: string): Promise<RouteSheetItem | null>;

  updateResult(
    id: string,
    result: RouteSheetItemResult,
    collectedAmount?: number,
    notes?: string,
    productDelivered?: boolean,
    paymentReceived?: boolean,
  ): Promise<void>;

  deleteById(id: string): Promise<void>;
}
