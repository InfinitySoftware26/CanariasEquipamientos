import { useAuthStore } from "@/store/auth.store";
import { CreateSalePayload } from "@/types/sales/createSale.type";
import { apiFetch } from "./apiFetch.service";

export async function createSale(data: CreateSalePayload) {
  const token = useAuthStore.getState().accessToken;
  const res = await apiFetch("/sales", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    console.error("SALE ERROR:", error);
    throw new Error(JSON.stringify(error));
  }

  return res.json();
}

export async function getMySales() {
  const token = useAuthStore.getState().accessToken;

  if (!token) {
    throw new Error("NO_TOKEN");
  }

  const res = await apiFetch("/sales/my", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Error obteniendo ventas (${res.status})`);
  }

  const json = await res.json();

  console.log("SALES RESPONSE:", json);

  // soporta ambas respuestas
  return Array.isArray(json) ? json : (json.data ?? []);
}

export async function getSaleById(id: string) {
  const token = useAuthStore.getState().accessToken;

  const res = await apiFetch(`/sales/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  console.log("STATUS:", res.status);

  const json = await res.json();

  console.log("SALE DETAIL:", json);

  if (!res.ok) {
    throw new Error(`Error obteniendo venta (${res.status})`);
  }

  return json.data ?? json;
}

export async function getSales() {
  const token = useAuthStore.getState().accessToken;

  if (!token) {
    throw new Error("NO_TOKEN");
  }

  const res = await apiFetch("/sales", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Error obteniendo ventas (${res.status})`);
  }

  const json = await res.json();

  console.log("ALL SALES:", json);

  return Array.isArray(json) ? json : (json.data ?? []);
}

export async function getPendingSales() {
  const token = useAuthStore.getState().accessToken;
  const res = await apiFetch("/sales/pending", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Error obteniendo ventas pendientes");
  }

  const json = await res.json();

  return Array.isArray(json) ? json : (json.data ?? []);
}

export async function adminValidateSale(
  saleId: string,
  status: "approved" | "rejected",
  observations?: string,
) {
  const token = useAuthStore.getState().accessToken;
  const res = await apiFetch(`/sales/${saleId}/admin-validate`, {
    method: "PATCH",
    body: JSON.stringify({
      status,
      observations,
    }),
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Error validando venta");
  }
  const text = await res.text();

  return text ? JSON.parse(text) : null;
}

export async function assignCollector(saleId: string, collectorId: string) {
  const token = useAuthStore.getState().accessToken;
  const res = await apiFetch(`/sales/${saleId}/assign-collector`, {
    method: "PATCH",
    body: JSON.stringify({ collectorId }),
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Error asignando collector");
  }

  return true;
}
