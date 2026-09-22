export const RouteSheetStatus = {
  PENDING: "pending",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const;

export type RouteSheetStatus =
  (typeof RouteSheetStatus)[keyof typeof RouteSheetStatus];

export const RouteSheetItemType = {
  INSTALLMENT: "installment",
  DELIVERY: "delivery",
} as const;

export type RouteSheetItemType =
  (typeof RouteSheetItemType)[keyof typeof RouteSheetItemType];

export const RouteSheetItemResult = {
  PENDING: "pending",
  COMPLETED: "completed",
  FAILED: "failed",
} as const;

export type RouteSheetItemResult =
  (typeof RouteSheetItemResult)[keyof typeof RouteSheetItemResult];

export type RouteSheetCollectionState =
  | "overdue"
  | "due_today"
  | "partial"
  | "pending";

export interface RouteSheet {
  routeSheetId: string;

  societyId: string;

  zoneId: string;

  staffId: string;

  assignedBy: string | null;

  routeDate: string;

  status: RouteSheetStatus;

  notes?: string | null;

  zoneName?: string | null;

  staffName?: string | null;

  createdAt?: string;

  updatedAt?: string;
}

export interface RouteSheetItem {
  itemId: string;
  routeSheetId: string;

  itemType: "installment" | "delivery";

  result: "pending" | "completed" | "failed";

  clientId: string;

  saleId?: string | null;
  installmentId?: string | null;

  clientName?: string | null;
  clientDocumentNumber?: string | null;
  clientAddress?: string | null;
  clientPhone?: string | null;

  installmentNumber?: number | null;

  installmentAmount?: number | null;

  installmentRemainingAmount?: number | null;

  installmentDueDate?: string | null;

  installmentStatus?: "pending" | "partial" | "paid" | "overdue" | null;

  lateInterestAmount?: number | null;

  daysLate?: number | null;

  totalToCollect?: number | null;

  collectedAmount?: number | null;

  productDelivered?: boolean | null;

  paymentReceived?: boolean | null;

  notes?: string | null;

  visitedAt?: string | null;

  sale?: {
    saleId?: string;

    totalAmount?: number;

    installmentAmount?: number;

    installmentsCount?: number;

    products?: Array<{
      saleProductId?: string;

      quantity?: number;

      product?: {
        productId?: string;

        name?: string;

        brand?: string;
      };
    }>;
  } | null;
}
export interface RouteSheetDetail extends RouteSheet {
  items: RouteSheetItem[];
}

export interface RouteSheetFilters {
  zoneId?: string;

  staffId?: string;

  status?: RouteSheetStatus;

  routeDate?: string;
}

export interface CreateRouteSheetPayload {
  zoneId: string;

  staffId: string;

  routeDate: string;

  notes?: string;
}

export interface AddRouteSheetInstallmentPayload {
  installmentId: string;
}

export interface ReassignRouteSheetPayload {
  staffId: string;
}

export interface GenerateRouteSheetsPayload {
  routeDate: string;
}

export interface GenerateRouteSheetsResult {
  routeDate: string;

  created: number;

  skipped: number;

  routeSheets: RouteSheet[];

  skippedGroups: Array<{
    zoneId: string;

    staffId: string;

    reason: string;
  }>;

  collectionsFound?: number;

  deliveriesFound?: number;
}

export interface AvailableRouteSheetInstallment {
  installmentId: string;
  installmentNumber: number;
  amount: number;
  remainingAmount: number;
  dueDate: string;
  lateInterestAmount: number;
  totalToCollect: number;
  clientId: string;
  clientName: string | null;
  clientDocumentNumber: string | null;
  saleId: string;
}

export interface UpdateRouteSheetItemPayload {
  result: "completed" | "failed";

  collectedAmount?: number;

  failedVisitReason?:
    | "client_absent"
    | "refused_payment"
    | "wrong_address"
    | "other";

  notes?: string;

  productDelivered?: boolean;

  paymentReceived?: boolean;
}
