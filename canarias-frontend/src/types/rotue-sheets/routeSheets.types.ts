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

  assignedBy: string;

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

  clientId: string;

  installmentId?: string | null;

  saleId?: string | null;

  itemType: RouteSheetItemType;

  result: RouteSheetItemResult;

  collectedAmount?: number | null;

  notes?: string | null;

  visitedAt?: string | null;

  createdAt?: string;

  updatedAt?: string;

  // ==========================================================
  // CLIENTE
  // ==========================================================

  clientName?: string | null;

  clientDocumentNumber?: string | null;

  clientAddress?: string | null;

  clientPhone?: string | null;

  // ==========================================================
  // CUOTA
  // ==========================================================

  installmentNumber?: number | null;

  installmentAmount?: number | null;

  installmentRemainingAmount?: number | null;

  installmentDueDate?: string | null;

  // ==========================================================
  // MORA
  // ==========================================================

  lateInterestAmount?: number | null;

  daysLate?: number | null;

  totalToCollect?: number | null;

  collectionState?: RouteSheetCollectionState | null;

  // ==========================================================
  // COMPATIBILIDAD
  // ==========================================================

  saleTotalAmount?: number | null;

  sale?: {
    saleId: string;

    totalAmount: string;

    installmentAmount: string;

    installmentsCount: number;

    paymentFrequency: string;

    products?: Array<{
      saleProductId: string;

      productId: string;

      quantity: number;

      unitPrice: string;

      subtotal: string;

      product?: {
        name: string;

        brand?: string;

        model?: string;
      };
    }>;
  } | null;
}

export interface RouteSheetDetail extends RouteSheet {
  items: RouteSheetItem[];
}

export interface GenerateRouteSheetsResult {
  routeDate: string;

  created: number;

  skipped: number;

  routeSheets: RouteSheet[];

  skippedGroups?: Array<{
    zoneId: string;

    staffId: string;

    reason: string;
  }>;
}
