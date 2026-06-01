import { StaffRole } from "@/types/auth.types";

export function getDashboardRoute(role: StaffRole) {
  switch (role) {
    case StaffRole.SUPER_ADMIN:
      return "/dashboard/super-admin";

    case StaffRole.MANAGER:
      return "/dashboard/manager";

    case StaffRole.ADMIN:
      return "/dashboard/admin";

    case StaffRole.SELLER:
      return "/dashboard/seller";

    case StaffRole.COLLECTOR:
      return "/dashboard/collector";

    default:
      return "/login";
  }
}
