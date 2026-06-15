export enum StaffRole {
  SUPER_ADMIN = "super_admin",
  MANAGER = "gerente",
  ADMIN = "administrativo",
  SELLER = "vendedor",
  COLLECTOR = "cobrador",
}

export interface User {
  staffId: string;
  name: string;
  email: string;
  role: StaffRole;
  societyId: string | null;
  societies: Society[];
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface Society {
  societyId: string;
  societyName: string;
  status: string;
}
