import { useAuthStore } from "@/store/auth.store";
import { apiFetch } from "../apiFetch.service";

import { RouteSheetItem } from "@/types/rotue-sheets/routeSheets.types";
import { UpdateRouteSheetItemPayload } from "@/types/rotue-sheets/updateRouteSheets";

function getToken(): string {
  const accessToken = useAuthStore.getState().accessToken;

  if (!accessToken) {
    throw new Error("NO_TOKEN");
  }

  return accessToken;
}

export async function getRouteSheetItems(
  routeSheetId: string,
): Promise<RouteSheetItem[]> {
  const response = await apiFetch(
    `/route-sheet-items?routeSheetId=${encodeURIComponent(routeSheetId)}`,
    {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    },
  );

  if (!response.ok) {
    const text = await response.text().catch(() => "");

    throw new Error(
      text || `Error obteniendo ítems de la hoja (${response.status})`,
    );
  }

  const json = await response.json();

  return (
    Array.isArray(json) ? json : Array.isArray(json?.data) ? json.data : []
  ) as RouteSheetItem[];
}

export async function updateRouteSheetItem(
  itemId: string,
  payload: UpdateRouteSheetItemPayload,
): Promise<boolean> {
  const response = await apiFetch(`/route-sheet-items/${itemId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const json = await response.json().catch(() => null);

    const message = Array.isArray(json?.message)
      ? json.message.join(", ")
      : json?.message;

    throw new Error(
      message || `Error actualizando visita (${response.status})`,
    );
  }

  return true;
}
