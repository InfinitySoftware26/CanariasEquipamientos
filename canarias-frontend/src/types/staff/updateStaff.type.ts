import { StaffRole } from "../auth.types";

export interface UpdateStaffPayload {
  name: string;
  email: string;
  role: StaffRole;
  phone: string;
}