import { useAuthStore } from "@/store/auth.store";

import { apiFetch } from "../apiFetch.service";

import {
  GenerateRouteSheetsResult,
  RouteSheet,
  RouteSheetDetail,
} from "@/types/rotue-sheets/routeSheets.types";

import {
  AddRouteSheetInstallmentPayload,
  CreateRouteSheetPayload,
  GenerateRouteSheetsPayload,
  ReassignRouteSheetPayload,
} from "@/types/rotue-sheets/createRouteSheets.type";

import { UpdateRouteSheetStatusPayload } from "@/types/rotue-sheets/updateRouteSheets";

// ============================================================
// AUTH
// ============================================================

function getToken(): string {
  const token = useAuthStore.getState().accessToken;

  if (!token) {
    throw new Error("NO_TOKEN");
  }

  return token;
}

function authHeaders() {
  return {
    Authorization: `Bearer ${getToken()}`,
  };
}

// ============================================================
// RESPONSE
// ============================================================

async function parseResponse<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();

  if (!text) {
    return undefined as T;
  }

  const json = JSON.parse(text);

  return (json?.data ?? json) as T;
}

// ============================================================
// ERROR
// ============================================================

async function getErrorMessage(
  response: Response,
  fallback: string,
): Promise<string> {
  const text = await response.text().catch(() => "");

  if (!text) {
    return fallback;
  }

  try {
    const json = JSON.parse(text);

    if (Array.isArray(json?.message)) {
      return json.message.join(", ");
    }

    return json?.message ?? json?.error ?? fallback;
  } catch {
    return fallback;
  }
}

// ============================================================
// LISTAR HOJAS
// ============================================================

export async function getRouteSheets(): Promise<RouteSheet[]> {
  const response = await apiFetch("/route-sheets", {
    headers: authHeaders(),
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        `Error obteniendo hojas de ruta (${response.status})`,
      ),
    );
  }

  const result = await parseResponse<RouteSheet[]>(response);

  return Array.isArray(result) ? result : [];
}

// ============================================================
// MIS HOJAS
// ============================================================

export async function getMyRouteSheets(): Promise<RouteSheet[]> {
  /*
   * El backend ya detecta por JWT si el usuario
   * es cobrador y filtra sus propias hojas.
   */
  return getRouteSheets();
}

// ============================================================
// DETALLE
// ============================================================

export async function getRouteSheetById(id: string): Promise<RouteSheetDetail> {
  if (!id || id === "undefined" || id === "null") {
    throw new Error("ID de hoja de ruta inválido");
  }

  const response = await apiFetch(`/route-sheets/${id}`, {
    headers: authHeaders(),
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        `Error obteniendo hoja de ruta (${response.status})`,
      ),
    );
  }

  return parseResponse<RouteSheetDetail>(response);
}

// ============================================================
// CREAR UNA HOJA
// ============================================================

export async function createRouteSheet(
  payload: CreateRouteSheetPayload,
): Promise<RouteSheetDetail> {
  const response = await apiFetch("/route-sheets", {
    method: "POST",

    headers: {
      ...authHeaders(),

      "Content-Type": "application/json",
    },

    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        `Error creando hoja de ruta (${response.status})`,
      ),
    );
  }

  return parseResponse<RouteSheetDetail>(response);
}

// ============================================================
// GENERAR TODAS LAS HOJAS DE UNA FECHA
// ============================================================

export async function generateRouteSheets(
  payload: GenerateRouteSheetsPayload,
): Promise<GenerateRouteSheetsResult> {
  const response = await apiFetch("/route-sheets/generate", {
    method: "POST",

    headers: {
      ...authHeaders(),

      "Content-Type": "application/json",
    },

    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        `Error generando hojas de ruta (${response.status})`,
      ),
    );
  }

  return parseResponse<GenerateRouteSheetsResult>(response);
}

// ============================================================
// ACTUALIZAR ESTADO
// ============================================================

export async function updateRouteSheetStatus(
  id: string,
  payload: UpdateRouteSheetStatusPayload,
): Promise<void> {
  const response = await apiFetch(`/route-sheets/${id}/status`, {
    method: "PATCH",

    headers: {
      ...authHeaders(),

      "Content-Type": "application/json",
    },

    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "Error actualizando el estado de la hoja de ruta",
      ),
    );
  }
}

// ============================================================
// AGREGAR CUOTA MANUALMENTE
// ============================================================

export async function addInstallmentToRouteSheet(
  routeSheetId: string,
  payload: AddRouteSheetInstallmentPayload,
): Promise<unknown> {
  const response = await apiFetch(
    `/route-sheets/${routeSheetId}/installments`,
    {
      method: "POST",

      headers: {
        ...authHeaders(),

        "Content-Type": "application/json",
      },

      body: JSON.stringify(payload),
    },
  );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "No se pudo agregar la cuota a la hoja de ruta",
      ),
    );
  }

  return parseResponse(response);
}

// ============================================================
// REASIGNAR COBRADOR
// ============================================================

export async function reassignRouteSheetCollector(
  routeSheetId: string,
  payload: ReassignRouteSheetPayload,
): Promise<RouteSheetDetail> {
  const response = await apiFetch(`/route-sheets/${routeSheetId}/collector`, {
    method: "PATCH",

    headers: {
      ...authHeaders(),

      "Content-Type": "application/json",
    },

    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "No se pudo reasignar el cobrador"),
    );
  }

  return parseResponse<RouteSheetDetail>(response);
}
