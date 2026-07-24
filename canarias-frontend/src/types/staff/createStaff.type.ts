import { StaffRole } from "../auth.types";

export interface CreateStaffPayload {
  name: string;
  dni: string;
  email: string;
  password?: string;
  role: StaffRole;
  societyId?: string;
  phone: string;
}
