import { StaffRole } from "../auth.types";

export interface Staff {
  id: string;
  name: string;
  dni: string;
  email: string;
  role: StaffRole;
  societyId?: string;
}
