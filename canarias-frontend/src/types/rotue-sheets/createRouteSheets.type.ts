export interface CreateRouteSheetPayload {
  zoneId: string;
  staffId: string;
  routeDate: string;
  notes?: string;
}

export interface GenerateRouteSheetsPayload {
  routeDate: string;
}

export interface AddRouteSheetInstallmentPayload {
  installmentId: string;
}

export interface ReassignRouteSheetPayload {
  staffId: string;
}
