import { useAuthStore } from "@/store/auth.store";
import { apiFetch } from "../apiFetch.service";
import {
  CreateSettlementPayload,
  Settlement,
  SettlementFilters,
  ValidateSettlementPayload,
} from "@/types/settlements/settlement.types";

function getToken() {
  const token = useAuthStore.getState().accessToken;

  if (!token) {
    throw new Error("NO_TOKEN");
  }

  return token;
}

async function getResponseData<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();

  if (!text) {
    return undefined as T;
  }

  try {
    const json = JSON.parse(text);

    return json.data ?? json;
  } catch {
    return text as T;
  }
}

async function getErrorMessage(response: Response, fallback: string) {
  const text = await response.text();

  if (!text) {
    return fallback;
  }

  try {
    const json = JSON.parse(text);

    if (Array.isArray(json.message)) {
      return json.message.join(", ");
    }

    return json.message || fallback;
  } catch {
    return fallback;
  }
}

export async function getSettlements(
  filters?: SettlementFilters,
): Promise<Settlement[]> {
  const token = getToken();
  const params = new URLSearchParams();

  if (filters?.status) params.append("status", filters.status);
  if (filters?.staffId) params.append("staffId", filters.staffId);

  const queryString = params.toString();
  const endpoint = queryString
    ? `/settlements?${queryString}`
    : "/settlements";

  const response = await apiFetch(endpoint, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Error obteniendo liquidaciones"),
    );
  }

  const data = await getResponseData<Settlement[] | { data?: Settlement[] }>(
    response,
  );

  return Array.isArray(data) ? data : [];
}

export async function getSettlementById(id: string): Promise<Settlement> {
  const token = getToken();

  const response = await apiFetch(`/settlements/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Error obteniendo la liquidación"),
    );
  }

  return getResponseData<Settlement>(response);
}

// Genera una liquidación a partir de un cierre validado. Disponible en el
// service pero sin exponer en la UI todavía (pendiente de definir flujo).
export async function createSettlement(
  payload: CreateSettlementPayload,
): Promise<Settlement> {
  const token = getToken();

  const response = await apiFetch("/settlements", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Error generando la liquidación"),
    );
  }

  return getResponseData<Settlement>(response);
}

export async function validateSettlement(
  id: string,
  payload: ValidateSettlementPayload,
): Promise<void> {
  const token = getToken();

  const response = await apiFetch(`/settlements/${id}/validate`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Error validando la liquidación"),
    );
  }
}
