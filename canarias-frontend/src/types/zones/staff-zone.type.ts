export type StaffZoneStatus = "active" | "inactive";

export interface ZoneStaff {
  staffId: string;

  name: string;

  email: string;

  role: string;

  status: StaffZoneStatus;

  assignedAt: string;
}

export interface AssignStaffPayload {
  staffId: string;

  status?: StaffZoneStatus;
}
