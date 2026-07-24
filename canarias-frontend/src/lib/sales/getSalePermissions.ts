import { StaffRole } from "@/types/auth.types";
import { salePermissions } from "./salePermissions";

export function getSalePermissions(role?: StaffRole) {
  if (!role) return null;

  return salePermissions[role];
}
