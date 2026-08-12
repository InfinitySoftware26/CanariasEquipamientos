export const RouteSheetStatus = {
  PENDING: "pending",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const;

export type RouteSheetStatus =
  (typeof RouteSheetStatus)[keyof typeof RouteSheetStatus];

export type RouteSheetItemType = "installment" | "delivery";

export const RouteSheetItemResult = {
  PENDING: "pending",
  COMPLETED: "completed",
  FAILED: "failed",
} as const;

export type RouteSheetItemResult =
  (typeof RouteSheetItemResult)[keyof typeof RouteSheetItemResult];

export interface RouteSheet {
  routeSheetId: string;

  societyId: string;

  zoneId: string;

  staffId: string;

  assignedBy: string;

  routeDate: string;

  status: RouteSheetStatus;

  zoneName?: string;

  staffName?: string;
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

  createdAt: string;

  updatedAt: string;

  clientName?: string | null;

  clientDocumentNumber?: string | null;

  clientAddress?: string | null;

  clientPhone?: string | null;

  installmentAmount?: number | null;

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
