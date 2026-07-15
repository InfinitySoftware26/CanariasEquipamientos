export type ZoneStatus = "active" | "inactive";

export interface Zone {
  zoneId: string;
  societyId: string;

  name: string;
  description?: string;

  status: ZoneStatus;

  createdAt: string;
  updatedAt: string;
}

export interface CreateZonePayload {
  name: string;
  description?: string;
}

export interface UpdateZonePayload {
  name?: string;
  description?: string;
  status?: ZoneStatus;
}
