import { RouteSheetItemResult, RouteSheetStatus } from "./routeSheets.types";

export interface UpdateRouteSheetStatusPayload {
  status: RouteSheetStatus;
}

export interface UpdateRouteSheetItemPayload {
  result: RouteSheetItemResult;

  collectedAmount?: number;

  notes?: string;
}
