import { useAuthStore } from "@/store/auth.store";
import { apiFetch } from "../apiFetch.service";
import {
  RouteSheet,
  RouteSheetDetail,
  RouteSheetItem,
} from "@/types/rotue-sheets/routeSheets.types";
import { CreateRouteSheetPayload } from "@/types/rotue-sheets/createRouteSheets.type";
import { UpdateRouteSheetStatusPayload } from "@/types/rotue-sheets/updateRouteSheets";
import { getSales } from "../sales.service";
import { getClientById } from "../client.service";
import { Sale } from "@/types/sales/sale.type";

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

export async function getRouteSheetById(id: string): Promise<RouteSheetDetail> {
  const token = useAuthStore.getState().accessToken;

  if (!token) {
    throw new Error("NO_TOKEN");
  }

  if (!id || id === "undefined" || id === "null") {
    throw new Error("ID de hoja de ruta inválido");
  }

  console.log("🔎 GET /route-sheets/:id", {
    id,
    url: `/route-sheets/${id}`,
  });

  const res = await apiFetch(`/route-sheets/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => null);

    console.error("❌ Error del backend:", {
      status: res.status,
      statusText: res.statusText,
      error,
    });

    const message = Array.isArray(error?.message)
      ? error.message.join(", ")
      : error?.message;

    throw new Error(message ?? `Error obteniendo hoja (${res.status})`);
  }

  const json = await res.json();

  const routeSheet = (json.data ?? json) as RouteSheetDetail;

  console.log("✅ HOJA DE RUTA:", routeSheet);

  console.log("📦 ITEMS DE LA HOJA:", routeSheet.items);

  // ---------------------------------------------------------
  // 1. Obtenemos todas las ventas
  // ---------------------------------------------------------

  let sales: Sale[] = [];

  try {
    sales = await getSales();

    console.log("💰 VENTAS DISPONIBLES:", sales);
  } catch (error) {
    console.error("❌ No se pudieron obtener las ventas:", error);
  }

  // ---------------------------------------------------------
  // 2. Enriquecemos cada item
  // ---------------------------------------------------------

  const enrichedItems = await Promise.all(
    routeSheet.items.map(async (item) => {
      console.log("🔎 PROCESANDO ITEM:", item);

      // -----------------------------------------------------
      // Buscar venta
      // -----------------------------------------------------

      let sale: Sale | undefined;

      // Caso 1:
      // El backend nos dio saleId
      if (item.saleId) {
        sale = sales.find((s) => s.saleId === item.saleId);
      }

      // Caso 2:
      // Es una cuota y saleId viene null.
      // Buscamos por clientId.
      if (!sale && item.clientId) {
        sale = sales.find((s) => s.clientId === item.clientId);
      }

      console.log("💰 VENTA ENCONTRADA:", {
        itemId: item.itemId,
        clientId: item.clientId,
        saleId: item.saleId,
        sale,
      });

      // -----------------------------------------------------
      // Buscar cliente
      // -----------------------------------------------------

      let client = sale?.client;

      // Si la venta no trae el cliente embebido,
      // lo buscamos directamente.
      if (!client && item.clientId) {
        try {
          const clientResponse = await getClientById(item.clientId);

          if (clientResponse) {
            client = {
              clientId: clientResponse.clientId,
              name: clientResponse.name ?? "",
              surname: clientResponse.surname ?? "",
              documentNumber: clientResponse.documentNumber,
              address: clientResponse.address,
              phone: clientResponse.phone,
              email: clientResponse.email,
              societyId: clientResponse.societyId,
            };
          }
        } catch (error) {
          console.error("❌ Error obteniendo cliente:", item.clientId, error);
        }
      }

      // -----------------------------------------------------
      // Datos visuales del cliente
      // -----------------------------------------------------

      const clientName = client
        ? `${client.name ?? ""} ${client.surname ?? ""}`.trim()
        : null;

      // -----------------------------------------------------
      // Importe de cuota
      // -----------------------------------------------------

      let installmentAmount: number | null = null;

      if (sale?.installmentAmount) {
        installmentAmount = Number(sale.installmentAmount);
      }

      /*
       * Fallback:
       *
       * Si la venta no tiene installmentAmount pero sí
       * totalAmount + installmentsCount, podemos calcular
       * aproximadamente el valor de la cuota.
       */
      if (
        installmentAmount === null &&
        sale?.totalAmount &&
        sale?.installmentsCount
      ) {
        installmentAmount = Number(sale.totalAmount) / sale.installmentsCount;
      }

      // -----------------------------------------------------
      // Resultado final
      // -----------------------------------------------------

      const enrichedItem: RouteSheetItem = {
        ...item,

        saleId: item.saleId ?? sale?.saleId ?? null,

        clientName,

        clientAddress: client?.address ?? null,

        clientPhone: client?.phone ?? null,

        installmentAmount,

        saleTotalAmount: sale?.totalAmount ? Number(sale.totalAmount) : null,
      };

      console.log("✨ ITEM ENRIQUECIDO:", enrichedItem);

      return enrichedItem;
    }),
  );

  console.log("✨✨ ITEMS ENRIQUECIDOS:", enrichedItems);

  return {
    ...routeSheet,
    items: enrichedItems,
  };
}

export async function createRouteSheet(payload: CreateRouteSheetPayload) {
  const token = useAuthStore.getState().accessToken;

  const res = await apiFetch("/route-sheets", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const json = await res.json();

  console.log("POST /route-sheets RESPONSE:", json);

  if (!res.ok) {
    throw new Error(json.message);
  }

  return (json.data ?? json) as RouteSheetDetail;
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

export async function getMyRouteSheets() {
  const token = useAuthStore.getState().accessToken;

  console.log("🟡 TOKEN:", token);

  const res = await apiFetch("/route-sheets", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  console.log("🟡 STATUS /route-sheets:", res.status);

  if (!res.ok) {
    const error = await res.json();
    console.error("🔴 ERROR /route-sheets:", error);

    throw new Error("Error obteniendo mis hojas de ruta");
  }

  const json = await res.json();

  console.log("🟢 RESPONSE /route-sheets:", json);

  return (Array.isArray(json) ? json : (json.data ?? [])) as RouteSheet[];
}
