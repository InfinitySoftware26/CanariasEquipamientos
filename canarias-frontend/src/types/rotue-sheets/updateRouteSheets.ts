import { RouteSheetStatus, RouteSheetItemResult } from "./routeSheets.types";

export interface UpdateRouteSheetStatusPayload {
  status: RouteSheetStatus;
}

export interface UpdateRouteSheetItemPayload {
  result: RouteSheetItemResult;

  collectedAmount?: number;

  notes?: string;

  failedVisitReason?:
    | "client_absent"
    | "refused_payment"
    | "wrong_address"
    | "other";
}
