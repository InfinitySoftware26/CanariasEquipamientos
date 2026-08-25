import { useAuthStore } from "@/store/auth.store";

import { apiFetch } from "../apiFetch.service";

import {
  RouteSheet,
  RouteSheetDetail,
} from "@/types/rotue-sheets/routeSheets.types";

import { CreateRouteSheetPayload } from "@/types/rotue-sheets/createRouteSheets.type";

import { AvailableRouteInstallment } from "@/types/rotue-sheets/available-installment.type";

import { UpdateRouteSheetStatusPayload } from "@/types/rotue-sheets/updateRouteSheets";

// ============================================================
// LISTAR HOJAS
// ============================================================

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

// ============================================================
// CUOTAS DISPONIBLES
// ============================================================

export async function getAvailableInstallments(
  zoneId: string,
  staffId: string,
  routeDate: string,
): Promise<AvailableRouteInstallment[]> {
  const token = useAuthStore.getState().accessToken;

  if (!token) {
    throw new Error("NO_TOKEN");
  }

  const params = new URLSearchParams({
    zoneId,
    staffId,
    routeDate,
  });

  const response = await apiFetch(
    `/route-sheets/available-installments?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const text = await response.text();

  let json: {
    data?: AvailableRouteInstallment[];
    message?: string | string[];
    error?: string;
    statusCode?: number;
  } | null = null;

  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }

  if (!response.ok) {
    const message = Array.isArray(json?.message)
      ? json.message.join(", ")
      : json?.message;

    console.error("❌ ERROR OBTENIENDO CUOTAS");
    console.error("STATUS:", response.status);
    console.error("STATUS TEXT:", response.statusText);
    console.error("PARAMS:", {
      zoneId,
      staffId,
      routeDate,
    });
    console.error("RESPUESTA BACKEND:", json);

    throw new Error(
      message ??
        json?.error ??
        `Error obteniendo cuotas disponibles (${response.status})`,
    );
  }

  return Array.isArray(json) ? json : (json?.data ?? []);
}

// ============================================================
// OBTENER UNA HOJA
// ============================================================

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

// ============================================================
// CREAR HOJA DE RUTA
// ============================================================

export async function createRouteSheet(
  payload: CreateRouteSheetPayload,
): Promise<RouteSheetDetail> {
  const token = useAuthStore.getState().accessToken;

  if (!token) {
    throw new Error("NO_TOKEN");
  }

  // ==========================================================
  // VALIDACIONES FRONTEND
  // ==========================================================

  if (!payload.zoneId) {
    throw new Error("Debés seleccionar una zona");
  }

  if (!payload.staffId) {
    throw new Error("Debés seleccionar un cobrador");
  }

  if (!payload.routeDate) {
    throw new Error("Debés seleccionar una fecha");
  }

  if (!payload.installmentIds || payload.installmentIds.length === 0) {
    throw new Error(
      "Debés seleccionar al menos una cuota para crear la hoja de ruta",
    );
  }

  // ==========================================================
  // REQUEST
  // ==========================================================

  console.log("==========================================");
  console.log("🚀 CREATE ROUTE SHEET");
  console.log("==========================================");
  console.log("PAYLOAD:", payload);

  const res = await apiFetch("/route-sheets", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  // ==========================================================
  // LEER RESPUESTA
  // ==========================================================

  const text = await res.text();

  let json: {
    data?: RouteSheetDetail;
    message?: string | string[];
    error?: string;
    statusCode?: number;
  } | null = null;

  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }

  console.log("==========================================");
  console.log("📦 RESPUESTA CREAR HOJA");
  console.log("==========================================");
  console.log("STATUS:", res.status);
  console.log("OK:", res.ok);
  console.log("RAW RESPONSE:", text);
  console.log("JSON RESPONSE:", json);
  console.log("==========================================");

  // ==========================================================
  // ERROR
  // ==========================================================

  if (!res.ok) {
    const message = Array.isArray(json?.message)
      ? json.message.join(", ")
      : json?.message;

    console.log("❌ CREAR HOJA - ERROR");
    console.log("STATUS:", res.status);
    console.log("PAYLOAD:", payload);
    console.log("RESPUESTA:", json);
    console.log("MESSAGE:", message);

    throw new Error(
      message ?? json?.error ?? `Error creando hoja de ruta (${res.status})`,
    );
  }

  // ==========================================================
  // SUCCESS
  // ==========================================================

  const result = (json?.data ?? json) as RouteSheetDetail;

  if (!result?.routeSheetId) {
    console.error(
      "❌ La API respondió correctamente pero no devolvió routeSheetId",
    );

    throw new Error(
      "La hoja de ruta fue creada pero el servidor no devolvió su identificación.",
    );
  }

  console.log("✅ HOJA DE RUTA CREADA:", result);

  return result;
}

// ============================================================
// ACTUALIZAR ESTADO
// ============================================================

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

// ============================================================
// MIS HOJAS
// ============================================================

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
