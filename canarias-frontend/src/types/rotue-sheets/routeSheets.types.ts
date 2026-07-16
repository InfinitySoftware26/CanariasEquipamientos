export enum RouteSheetStatus {
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export enum RouteSheetItemType {
  INSTALLMENT = "INSTALLMENT",
  DELIVERY = "DELIVERY",
}

export enum RouteSheetItemResult {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  RESCHEDULED = "RESCHEDULED",
}

export interface RouteSheetItem {
  itemId: string;

  routeSheetId: string;

  clientId: string;

  installmentId: string | null;

  saleId: string | null;

  itemType: RouteSheetItemType;

  result: RouteSheetItemResult;

  collectedAmount: number | null;

  notes: string | null;

  visitedAt: string | null;

  createdAt: string;

  updatedAt: string;
}

export interface RouteSheet {
  routeSheetId: string;

  societyId: string;

  zoneId: string;

  staffId: string;

  assignedBy: string;

  routeDate: string;

  status: RouteSheetStatus;

  notes: string | null;

  createdAt: string;

  updatedAt: string;
}

export interface RouteSheetDetail extends RouteSheet {
  items: RouteSheetItem[];
}
