import { useAuthStore } from "@/store/auth.store";
import { apiFetch } from "../apiFetch.service";
import {
  ClosureFilters,
  ClosureReconciliation,
  CreateClosurePayload,
  DailyClosure,
  ValidateClosurePayload,
} from "@/types/closures/closure.types";

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

export async function getClosures(
  filters?: ClosureFilters,
): Promise<DailyClosure[]> {
  const token = getToken();
  const params = new URLSearchParams();

  if (filters?.status) params.append("status", filters.status);
  if (filters?.closingDate) params.append("closingDate", filters.closingDate);
  if (filters?.staffId) params.append("staffId", filters.staffId);

  const queryString = params.toString();
  const endpoint = queryString ? `/closures?${queryString}` : "/closures";

  const response = await apiFetch(endpoint, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Error obteniendo cierres diarios"),
    );
  }

  const data = await getResponseData<
    DailyClosure[] | { data?: DailyClosure[] }
  >(response);

  return Array.isArray(data) ? data : [];
}

export async function getClosureById(id: string): Promise<DailyClosure> {
  const token = getToken();

  const response = await apiFetch(`/closures/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Error obteniendo el cierre"),
    );
  }

  return getResponseData<DailyClosure>(response);
}

export async function getClosureReconciliation(
  id: string,
): Promise<ClosureReconciliation> {
  const token = getToken();

  const response = await apiFetch(`/closures/${id}/reconciliation`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Error obteniendo la conciliación"),
    );
  }

  return getResponseData<ClosureReconciliation>(response);
}

export async function createClosure(
  payload: CreateClosurePayload,
): Promise<DailyClosure> {
  const token = getToken();

  const response = await apiFetch("/closures", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Error declarando el cierre diario"),
    );
  }

  return getResponseData<DailyClosure>(response);
}

export async function validateClosure(
  id: string,
  payload: ValidateClosurePayload,
): Promise<void> {
  const token = getToken();

  const response = await apiFetch(`/closures/${id}/validate`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Error validando el cierre"),
    );
  }
}
