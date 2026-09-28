import { useAuthStore } from "@/store/auth.store";
import { apiFetch } from "../apiFetch.service";
import {
  FailedVisit,
  FailedVisitFilters,
  RescheduleFailedVisitPayload,
} from "@/types/failed-visits/failed-visitis.type";

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

export async function getFailedVisits(
  filters?: FailedVisitFilters,
): Promise<FailedVisit[]> {
  const token = getToken();
  const params = new URLSearchParams();

  if (filters?.clientId) params.append("clientId", filters.clientId);
  if (filters?.collectorId) params.append("collectorId", filters.collectorId);
  if (filters?.status) params.append("status", filters.status);
  if (filters?.from) params.append("from", filters.from);
  if (filters?.to) params.append("to", filters.to);

  const queryString = params.toString();
  const endpoint = queryString
    ? `/failed-visits?${queryString}`
    : "/failed-visits";

  const response = await apiFetch(endpoint, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Error obteniendo visitas fallidas"),
    );
  }

  const data = await getResponseData<FailedVisit[] | { data?: FailedVisit[] }>(
    response,
  );

  return Array.isArray(data) ? data : [];
}

export async function rescheduleFailedVisit(
  id: string,
  payload: RescheduleFailedVisitPayload,
): Promise<FailedVisit> {
  const token = getToken();

  const response = await apiFetch(`/failed-visits/${id}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Error reprogramando la visita"),
    );
  }

  return getResponseData<FailedVisit>(response);
}
