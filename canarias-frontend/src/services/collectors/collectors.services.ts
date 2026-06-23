import { useAuthStore } from "@/store/auth.store";
import { apiFetch } from "../apiFetch.service";

export async function getCollectors() {
  const token = useAuthStore.getState().accessToken;

  const res = await apiFetch("/staff", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Error obteniendo staff");
  }

  const json = await res.json();

  const staff = json.data ?? json;

  return staff.filter((person: { role: string }) => person.role === "cobrador");
}

export async function getCollectorById(id: string) {
  const token = useAuthStore.getState().accessToken;

  const res = await apiFetch(`/staff/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Error obteniendo cobrador");
  }

  const json = await res.json();

  return json.data ?? json;
}

export async function getCollectorSales() {
  const token = useAuthStore.getState().accessToken;

  if (!token) {
    throw new Error("NO_TOKEN");
  }

  const res = await apiFetch("/sales/collector", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Error obteniendo ventas del cobrador (${res.status})`);
  }

  const json = await res.json();

  console.log("COLLECTOR SALES:", json);

  return Array.isArray(json) ? json : (json.data ?? []);
}

export async function envValidateSale(
  saleId: string,
  status: "approved" | "rejected",
  observations?: string,
) {
  const token = useAuthStore.getState().accessToken;

  const res = await apiFetch(`/sales/${saleId}/env-validate`, {
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

    throw new Error(error.message ?? "Error validando visita ambiental");
  }

  return true;
}
