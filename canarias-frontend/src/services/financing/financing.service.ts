import { useAuthStore } from "@/store/auth.store";
import { apiFetch } from "../apiFetch.service";
import {
  FinancingConfig,
  UpdateFinancingPayload,
} from "@/types/financing/financing.types";

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

export async function getFinancingConfig(): Promise<FinancingConfig> {
  const token = getToken();

  const response = await apiFetch("/financing-config", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Error obteniendo la configuración de financiación"),
    );
  }

  return getResponseData<FinancingConfig>(response);
}

export async function updateFinancingConfig(
  payload: UpdateFinancingPayload,
): Promise<FinancingConfig> {
  const token = getToken();

  const response = await apiFetch("/financing-config", {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Error guardando la configuración de financiación"),
    );
  }

  return getResponseData<FinancingConfig>(response);
}
