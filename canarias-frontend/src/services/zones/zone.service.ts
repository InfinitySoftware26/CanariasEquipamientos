import { useAuthStore } from "@/store/auth.store";
import { apiFetch } from "../apiFetch.service";

import {
  Zone,
  CreateZonePayload,
  UpdateZonePayload,
} from "@/types/zones/zone.type";

import { ZoneStaff, AssignStaffPayload } from "@/types/zones/staff-zone.type";

const BASE = "/zones";

export async function getZones(): Promise<Zone[]> {
  const token = useAuthStore.getState().accessToken;

  if (!token) {
    throw new Error("NO_TOKEN");
  }

  const res = await apiFetch(BASE, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Error obteniendo zonas (${res.status})`);
  }

  const json = await res.json();

  return Array.isArray(json) ? json : (json.data ?? []);
}

export async function getZone(id: string): Promise<Zone> {
  const token = useAuthStore.getState().accessToken;

  if (!token) {
    throw new Error("NO_TOKEN");
  }
  const res = await apiFetch(`${BASE}/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const error = await res.text();

    console.log("GET STAFF STATUS:", res.status);
    console.log("GET STAFF ERROR:", error);

    throw new Error(error);
  }

  const json = await res.json();

  return json.data ?? json;
}

export async function createZone(payload: CreateZonePayload): Promise<Zone> {
  const token = useAuthStore.getState().accessToken;

  if (!token) {
    throw new Error("NO_TOKEN");
  }
  const res = await apiFetch(BASE, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error("Error creando zona");
  }

  const json = await res.json();

  return json.data ?? json;
}

export async function updateZone(
  id: string,
  payload: UpdateZonePayload,
): Promise<Zone> {
  const token = useAuthStore.getState().accessToken;

  if (!token) {
    throw new Error("NO_TOKEN");
  }
  const res = await apiFetch(`${BASE}/${id}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error("Error actualizando zona");
  }

  const json = await res.json();

  return json.data ?? json;
}

export async function deleteZone(id: string): Promise<void> {
  const token = useAuthStore.getState().accessToken;

  if (!token) {
    throw new Error("NO_TOKEN");
  }

  const res = await apiFetch(`${BASE}/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Error eliminando zona");
  }
}

export async function getZoneStaff(zoneId: string): Promise<ZoneStaff[]> {
  const token = useAuthStore.getState().accessToken;

  if (!token) {
    throw new Error("NO_TOKEN");
  }

  const res = await apiFetch(`${BASE}/${zoneId}/staff`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const error = await res.text();

    console.log("GET STAFF STATUS:", res.status);
    console.log("GET STAFF ERROR:", error);

    throw new Error("Error obteniendo personal de la zona");
  }

  const json = await res.json();

  console.log(json);

  return json.data ?? json;
}

export async function assignStaff(
  zoneId: string,
  payload: AssignStaffPayload,
): Promise<void> {
  const token = useAuthStore.getState().accessToken;

  if (!token) {
    throw new Error("NO_TOKEN");
  }

  const res = await apiFetch(`${BASE}/${zoneId}/staff`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error("Error asignando personal");
  }
}

export async function unassignStaff(
  zoneId: string,
  staffId: string,
): Promise<void> {
  const token = useAuthStore.getState().accessToken;

  if (!token) {
    throw new Error("NO_TOKEN");
  }

  const res = await apiFetch(`${BASE}/${zoneId}/staff/${staffId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Error desasignando personal");
  }
}
