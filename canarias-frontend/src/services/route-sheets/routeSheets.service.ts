import { useAuthStore } from "@/store/auth.store";
import { apiFetch } from "../apiFetch.service";

import {
  RouteSheet,
  RouteSheetDetail,
} from "@/types/rotue-sheets/routeSheets.types";

import { CreateRouteSheetPayload } from "@/types/rotue-sheets/createRouteSheets.type";

import { UpdateRouteSheetStatusPayload } from "@/types/rotue-sheets/updateRouteSheets";

export async function getRouteSheets(): Promise<RouteSheet[]> {
  const token = useAuthStore.getState().accessToken;

  if (!token) {
    throw new Error("NO_TOKEN");
  }

  const res = await apiFetch("/route-sheets", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    const message = Array.isArray(json?.message)
      ? json.message.join(", ")
      : json?.message;

    throw new Error(
      message ?? `Error obteniendo hojas de ruta (${res.status})`,
    );
  }

  return (
    Array.isArray(json) ? json : Array.isArray(json?.data) ? json.data : []
  ) as RouteSheet[];
}

export async function getRouteSheetById(id: string): Promise<RouteSheetDetail> {
  const token = useAuthStore.getState().accessToken;

  if (!token) {
    throw new Error("NO_TOKEN");
  }

  if (!id || id === "undefined" || id === "null") {
    throw new Error("ID de hoja de ruta inválido");
  }

  const res = await apiFetch(`/route-sheets/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    const message = Array.isArray(json?.message)
      ? json.message.join(", ")
      : json?.message;

    throw new Error(message ?? `Error obteniendo hoja de ruta (${res.status})`);
  }

  return (json?.data ?? json) as RouteSheetDetail;
}

export async function createRouteSheet(
  payload: CreateRouteSheetPayload,
): Promise<RouteSheetDetail> {
  const token = useAuthStore.getState().accessToken;

  if (!token) {
    throw new Error("NO_TOKEN");
  }

  const res = await apiFetch("/route-sheets", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    const message = Array.isArray(json?.message)
      ? json.message.join(", ")
      : json?.message;

    throw new Error(message ?? "Error creando hoja de ruta");
  }

  return (json?.data ?? json) as RouteSheetDetail;
}

export async function updateRouteSheetStatus(
  id: string,
  payload: UpdateRouteSheetStatusPayload,
): Promise<boolean> {
  const token = useAuthStore.getState().accessToken;

  if (!token) {
    throw new Error("NO_TOKEN");
  }

  const res = await apiFetch(`/route-sheets/${id}/status`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    const message = Array.isArray(json?.message)
      ? json.message.join(", ")
      : json?.message;

    throw new Error(
      message ?? `Error actualizando hoja de ruta (${res.status})`,
    );
  }

  return true;
}

export async function getMyRouteSheets(): Promise<RouteSheet[]> {
  const token = useAuthStore.getState().accessToken;

  if (!token) {
    throw new Error("NO_TOKEN");
  }

  const res = await apiFetch("/route-sheets", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    const message = Array.isArray(json?.message)
      ? json.message.join(", ")
      : json?.message;

    throw new Error(
      message ?? `Error obteniendo mis hojas de ruta (${res.status})`,
    );
  }

  return (
    Array.isArray(json) ? json : Array.isArray(json?.data) ? json.data : []
  ) as RouteSheet[];
}
