export type DailyClosureStatus = "pending" | "validated" | "rejected";

export interface DailyClosure {
  closureId: string;

  staffId: string;

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
  staffId?:string;
}

export interface ValidateClosurePayload {
  status: "validated" | "rejected";
  observations?: string;
}

export interface CreateClosurePayload {
  closingDate: string;
  totalCollected: number;
  notes?: string;
}
