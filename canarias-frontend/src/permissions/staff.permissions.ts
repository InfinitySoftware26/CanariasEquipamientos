import { StaffRole } from "@/types/auth.types";


const ROLE_CREATION_RULES: Record<StaffRole, StaffRole[]> = {
  [StaffRole.SUPER_ADMIN]: [
    StaffRole.MANAGER,
    StaffRole.ADMIN,
    StaffRole.SELLER,
    StaffRole.COLLECTOR,
  ],

  [StaffRole.MANAGER]: [
    StaffRole.ADMIN,
    StaffRole.SELLER,
    StaffRole.COLLECTOR,
  ],

  [StaffRole.ADMIN]: [
    StaffRole.SELLER,
    StaffRole.COLLECTOR,
  ],

  [StaffRole.SELLER]: [],

  [StaffRole.COLLECTOR]: [],
};

const ROLE_EDIT_RULES: Record<StaffRole, StaffRole[]> = {
  [StaffRole.SUPER_ADMIN]: [
    StaffRole.SUPER_ADMIN,
    StaffRole.MANAGER,
    StaffRole.ADMIN,
    StaffRole.SELLER,
    StaffRole.COLLECTOR,
  ],

  [StaffRole.MANAGER]: [
    StaffRole.SUPER_ADMIN,
    StaffRole.MANAGER,
    StaffRole.ADMIN,
    StaffRole.SELLER,
    StaffRole.COLLECTOR,
  ],

  [StaffRole.ADMIN]: [
    StaffRole.SELLER,
    StaffRole.COLLECTOR,
  ],

  [StaffRole.SELLER]: [],

  [StaffRole.COLLECTOR]: [],
};

export function getCreatableRoles(
  currentRole: StaffRole | null
): StaffRole[] {

  if (!currentRole) {
    return [];
  }

  return ROLE_CREATION_RULES[currentRole] ?? [];
}

export function canEditStaff(
  currentRole: StaffRole | null,
  targetRole: StaffRole,
): boolean {
  if (!currentRole) {
    return false;
  }

  return ROLE_EDIT_RULES[currentRole]?.includes(targetRole) ?? false;
}

export function canDeactivateStaff(
  currentRole: StaffRole | null,
  targetRole: StaffRole,
): boolean {
  return canEditStaff(currentRole, targetRole);
}