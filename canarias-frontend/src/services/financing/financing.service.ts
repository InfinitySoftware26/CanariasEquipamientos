import { useAuthStore } from "@/store/auth.store";
import { apiFetch } from "../apiFetch.service";

import {
  FinancingConfiguration,
  FinancingPlan,
  Promotion,
  CreateFinancingConfigPayload,
  UpdateFinancingConfigPayload,
  CreateFinancingPlanPayload,
  UpdateFinancingPlanPayload,
  CreatePromotionPayload,
  UpdatePromotionPayload,
} from "@/types/financing/financing.types";

function getToken() {
  const token = useAuthStore.getState().accessToken;

  if (!token) {
    throw new Error("NO_TOKEN");
  }

  return token;
}

function authHeaders(token: string, withBody = false) {
  return {
    Authorization: `Bearer ${token}`,
    ...(withBody ? { "Content-Type": "application/json" } : {}),
  };
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

    return (json.data ?? json) as T;
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

// ════════════════════════════════════════════════════════════════════════════
// FINANCING CONFIGURATION CRUD
// ════════════════════════════════════════════════════════════════════════════

export async function getAllFinancingConfigurations(): Promise<
  FinancingConfiguration[]
> {
  const token = getToken();

  const response = await apiFetch("/financing/configs", {
    headers: authHeaders(token),
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "Error obteniendo las configuraciones de financiación",
      ),
    );
  }

  return getResponseData<FinancingConfiguration[]>(response);
}

export async function getFinancingConfigurationById(
  financingConfigId: string,
): Promise<FinancingConfiguration> {
  const token = getToken();

  const response = await apiFetch(`/financing/configs/${financingConfigId}`, {
    headers: authHeaders(token),
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "Error obteniendo la configuración de financiación",
      ),
    );
  }

  return getResponseData<FinancingConfiguration>(response);
}

export async function createFinancingConfiguration(
  payload: CreateFinancingConfigPayload,
): Promise<FinancingConfiguration> {
  const token = getToken();

  const response = await apiFetch("/financing/configs", {
    method: "POST",
    headers: authHeaders(token, true),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "Error creando la configuración de financiación",
      ),
    );
  }

  return getResponseData<FinancingConfiguration>(response);
}

export async function updateFinancingConfiguration(
  financingConfigId: string,
  payload: UpdateFinancingConfigPayload,
): Promise<FinancingConfiguration> {
  const token = getToken();

  const response = await apiFetch(`/financing/configs/${financingConfigId}`, {
    method: "PUT",
    headers: authHeaders(token, true),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "Error actualizando la configuración de financiación",
      ),
    );
  }

  return getResponseData<FinancingConfiguration>(response);
}

export async function deleteFinancingConfiguration(
  financingConfigId: string,
): Promise<void> {
  const token = getToken();

  const response = await apiFetch(`/financing/configs/${financingConfigId}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "Error eliminando la configuración de financiación",
      ),
    );
  }
}

// ════════════════════════════════════════════════════════════════════════════
// FINANCING PLAN CRUD
// ════════════════════════════════════════════════════════════════════════════

export async function getFinancingPlans(): Promise<FinancingPlan[]> {
  const token = getToken();

  const response = await apiFetch("/financing/plans", {
    headers: authHeaders(token),
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Error obteniendo los planes de financiación"),
    );
  }

  return getResponseData<FinancingPlan[]>(response);
}

export async function getFinancingPlanById(
  financingPlanId: string,
): Promise<FinancingPlan> {
  const token = getToken();

  const response = await apiFetch(`/financing/plans/${financingPlanId}`, {
    headers: authHeaders(token),
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Error obteniendo el plan de financiación"),
    );
  }

  return getResponseData<FinancingPlan>(response);
}

export async function createFinancingPlan(
  payload: CreateFinancingPlanPayload,
): Promise<FinancingPlan> {
  const token = getToken();

  const response = await apiFetch("/financing/plans", {
    method: "POST",
    headers: authHeaders(token, true),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Error creando el plan de financiación"),
    );
  }

  return getResponseData<FinancingPlan>(response);
}

export async function updateFinancingPlan(
  financingPlanId: string,
  payload: UpdateFinancingPlanPayload,
): Promise<FinancingPlan> {
  const token = getToken();

  const response = await apiFetch(`/financing/plans/${financingPlanId}`, {
    method: "PUT",
    headers: authHeaders(token, true),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Error actualizando el plan de financiación"),
    );
  }

  return getResponseData<FinancingPlan>(response);
}

export async function deleteFinancingPlan(
  financingPlanId: string,
): Promise<void> {
  const token = getToken();

  const response = await apiFetch(`/financing/plans/${financingPlanId}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Error eliminando el plan de financiación"),
    );
  }
}

// ════════════════════════════════════════════════════════════════════════════
// PROMOTION CRUD
// ════════════════════════════════════════════════════════════════════════════

export async function getPromotions(): Promise<Promotion[]> {
  const token = getToken();

  const response = await apiFetch("/financing/promotions", {
    headers: authHeaders(token),
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Error obteniendo las promociones"),
    );
  }

  return getResponseData<Promotion[]>(response);
}

export async function getPromotionById(
  promotionId: string,
): Promise<Promotion> {
  const token = getToken();

  const response = await apiFetch(`/financing/promotions/${promotionId}`, {
    headers: authHeaders(token),
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Error obteniendo la promoción"),
    );
  }

  return getResponseData<Promotion>(response);
}

export async function createPromotion(
  payload: CreatePromotionPayload,
): Promise<Promotion> {
  const token = getToken();

  const response = await apiFetch("/financing/promotions", {
    method: "POST",
    headers: authHeaders(token, true),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Error creando la promoción"),
    );
  }

  return getResponseData<Promotion>(response);
}

export async function updatePromotion(
  promotionId: string,
  payload: UpdatePromotionPayload,
): Promise<Promotion> {
  const token = getToken();

  const response = await apiFetch(`/financing/promotions/${promotionId}`, {
    method: "PUT",
    headers: authHeaders(token, true),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Error actualizando la promoción"),
    );
  }

  return getResponseData<Promotion>(response);
}

export async function deletePromotion(promotionId: string): Promise<void> {
  const token = getToken();

  const response = await apiFetch(`/financing/promotions/${promotionId}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Error eliminando la promoción"),
    );
  }
}
