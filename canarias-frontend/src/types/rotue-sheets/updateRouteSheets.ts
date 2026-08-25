import { RouteSheetStatus, RouteSheetItemResult } from "./routeSheets.types";

export interface UpdateRouteSheetStatusPayload {
  status: RouteSheetStatus;
}

export interface UpdateRouteSheetItemPayload {
  result: RouteSheetItemResult;

  collectedAmount?: number;

  notes?: string;

  failedVisitReason?:
    | "Cliente Ausente"
    | "Pago Rechazado"
    | "Direccion incorrecta"
    | "Otro";
}
