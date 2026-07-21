import { StaffRole } from "../auth.types";

export interface StaffResponse {
  staffId: string;
  name: string;
  dni: string;
  email: string;
  role: StaffRole;
  phone?: string;
  isActive: boolean;
}