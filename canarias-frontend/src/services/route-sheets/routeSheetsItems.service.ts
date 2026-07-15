import { useAuthStore } from "@/store/auth.store";
import { apiFetch } from "../apiFetch.service";
import { RouteSheetItem } from "@/types/rotue-sheets/routeSheets.types";
import { UpdateRouteSheetItemPayload } from "@/types/rotue-sheets/updateRouteSheets";

function token() {
  const accessToken = useAuthStore.getState().accessToken;

  if (!accessToken) {
    throw new Error("NO_TOKEN");
  }

  return accessToken;
}

export async function getRouteSheetItems(routeSheetId: string) {
  const res = await apiFetch(
    `/route-sheet-items?routeSheetId=${routeSheetId}`,
    {
      headers: {
        Authorization: `Bearer ${token()}`,
      },
    },
  );

  if (!res.ok) {
    throw new Error("Error obteniendo ítems");
  }

  const json = await res.json();

  return (Array.isArray(json) ? json : (json.data ?? [])) as RouteSheetItem[];
}

export async function updateRouteSheetItem(
  itemId: string,
  payload: UpdateRouteSheetItemPayload,
) {
  const res = await apiFetch(`/route-sheet-items/${itemId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token()}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message ?? "Error actualizando visita");
  }

  return true;
}
