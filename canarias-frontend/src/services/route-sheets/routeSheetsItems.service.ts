import { useAuthStore } from "@/store/auth.store";

import {
  RouteSheetItem,
  UpdateRouteSheetItemPayload,
} from "@/types/rotue-sheets/routeSheets.types";
import { apiFetch } from "../apiFetch.service";

// ============================================================
// OBTENER ITEMS DE UNA HOJA
// ============================================================

export async function getRouteSheetItems(
  routeSheetId: string,
): Promise<RouteSheetItem[]> {
  const token = useAuthStore.getState().accessToken;

  const response = await apiFetch(
    `/route-sheet-items?routeSheetId=${routeSheetId}`,
    {
      method: "GET",

      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    const error = await response.json().catch(() => null);

    throw new Error(
      error?.message || "No se pudieron obtener los items de la hoja de ruta",
    );
  }

  return response.json();
}

// ============================================================
// ACTUALIZAR RESULTADO DE UNA VISITA
// ============================================================

export async function updateRouteSheetItem(
  itemId: string,
  payload: UpdateRouteSheetItemPayload,
): Promise<void> {
  const token = useAuthStore.getState().accessToken;

  const response = await apiFetch(`/route-sheet-items/${itemId}`, {
    method: "PATCH",

    headers: {
      Authorization: `Bearer ${token}`,

      "Content-Type": "application/json",
    },

    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);

    throw new Error(
      error?.message || "No se pudo actualizar el resultado de la visita",
    );
  }
}

// ============================================================
// QUITAR ITEM PENDIENTE DE UNA HOJA
// ============================================================

export async function removeRouteSheetItem(itemId: string): Promise<void> {
  const token = useAuthStore.getState().accessToken;
  const response = await apiFetch(`/route-sheet-items/${itemId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(
      error?.message || "No se pudo quitar el item de la hoja de ruta",
    );
  }
}
