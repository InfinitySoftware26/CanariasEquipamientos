import { useAuthStore } from "@/store/auth.store";
import { apiFetch } from "../apiFetch.service";
import { Sale } from "@/types/sales/sale.type";

export interface ConfigureCollectionSchedulePayload {
  collectionScheduleType: "fixed_weekday" | "monthly_range";

  collectionWeekday?: number;

  paymentRangeStartDay?: number;

  paymentRangeEndDay?: number;

  manualCollectionDate?: string;

  secondDueDate?: string;

  dailyLateInterestRate?: number;
}

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

export interface EnvironmentalVisitPayload {
  status: "approved" | "rejected";

  observations?: string;

  dniCopyReceived?: boolean;

  salaryReceiptReceived?: boolean;

  otherDocumentsReceived?: boolean;
}

export async function envValidateSale(
  saleId: string,
  payload: EnvironmentalVisitPayload,
) {
  const token = useAuthStore.getState().accessToken;

  const res = await apiFetch(`/sales/${saleId}/env-validate`, {
    method: "PATCH",

    headers: {
      Authorization: `Bearer ${token}`,

      "Content-Type": "application/json",
    },

    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => null);

    throw new Error(error?.message ?? "Error validando visita ambiental");
  }

  return true;
}
export async function configureCollectionSchedule(
  saleId: string,
  payload: ConfigureCollectionSchedulePayload,
): Promise<Sale | null> {
  const token = useAuthStore.getState().accessToken;

  const res = await apiFetch(`/sales/${saleId}/collection-schedule`, {
    method: "PATCH",

    headers: {
      Authorization: `Bearer ${token}`,

      "Content-Type": "application/json",
    },

    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => null);

    throw new Error(error?.message || "No se pudo configurar la cobranza");
  }

  const text = await res.text();

  return text ? JSON.parse(text) : null;
}
