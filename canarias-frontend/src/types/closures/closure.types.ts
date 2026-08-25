export type DailyClosureStatus = "Pendiente" | "Validado" | "Rechazado";

export interface ClosureStaff {
  staffId: string;
  name: string;
  surname: string;
}

export interface DailyClosure {
  closureId: string;

  staffId: string;
  staff: ClosureStaff;

  validatedBy: string | null;
  societyId: string;

  closingDate: string;
  totalCollected: number;

  status: DailyClosureStatus;

  notes?: string | null;

  createdAt: string;
  updatedAt: string;
}

export interface ClosureReconciliation {
  declared: number;
  systemCalculated: number;
  difference: number;
}

export interface ClosureFilters {
  status?: DailyClosureStatus;
  closingDate?: string;
  staffId?: string;
}

export interface ValidateClosurePayload {
  status: "Validado" | "Rechazado";
  observations?: string;
}

export interface CreateClosurePayload {
  closingDate: string;
  totalCollected: number;
  notes?: string;
}
