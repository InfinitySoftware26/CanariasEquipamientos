import { useAuthStore } from "@/store/auth.store";
import { apiFetch } from "../apiFetch.service";
import {
  RouteSheet,
  RouteSheetDetail,
} from "@/types/rotue-sheets/routeSheets.types";
import { CreateRouteSheetPayload } from "@/types/rotue-sheets/createRouteSheets.type";
import { UpdateRouteSheetStatusPayload } from "@/types/rotue-sheets/updateRouteSheets";

export async function getRouteSheets() {
  const token = useAuthStore.getState().accessToken;

  if (!token) {
    throw new Error("NO_TOKEN");
  }

  const res = await apiFetch("/route-sheets", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Error obteniendo hojas de ruta (${res.status})`);
  }

  const json = await res.json();

  return Array.isArray(json)
    ? (json as RouteSheet[])
    : ((json.data ?? []) as RouteSheet[]);
}

export async function getRouteSheetById(id: string) {
  const token = useAuthStore.getState().accessToken;

  if (!token) {
    throw new Error("NO_TOKEN");
  }

  const res = await apiFetch(`/route-sheets/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Error obteniendo hoja (${res.status})`);
  }

  const json = await res.json();

  return (json.data ?? json) as RouteSheetDetail;
}

export async function createRouteSheet(payload: CreateRouteSheetPayload) {
  const token = useAuthStore.getState().accessToken;

  const res = await apiFetch("/route-sheets", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.json();

    throw new Error(error.message);
  }

  return (await res.json()) as RouteSheetDetail;
}

export async function updateRouteSheetStatus(
  id: string,
  payload: UpdateRouteSheetStatusPayload,
) {
  const token = useAuthStore.getState().accessToken;

  const res = await apiFetch(`/route-sheets/${id}/status`, {
    method: "PATCH",

    headers: {
      Authorization: `Bearer ${token}`,
    },

    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.json();

    throw new Error(error.message);
  }

  return true;
}
