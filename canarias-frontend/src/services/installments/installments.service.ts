import { useAuthStore } from "@/store/auth.store";

import { apiFetch } from "../apiFetch.service";

import {
  Installment,
  PayInstallmentPayload,
} from "@/types/installments/installment.types";

/**
 * ============================================================
 * AUTH
 * ============================================================
 */

function getToken() {
  const token = useAuthStore.getState().accessToken;

  if (!token) {
    throw new Error("NO_TOKEN");
  }

  return token;
}

/**
 * ============================================================
 * RESPONSE HELPERS
 * ============================================================
 */

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

async function getErrorMessage(
  response: Response,
  fallback: string,
): Promise<string> {
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

/**
 * ============================================================
 * GET OVERDUE INSTALLMENTS
 * ============================================================
 */

export async function getOverdueInstallments(): Promise<Installment[]> {
  const token = getToken();

  const response = await apiFetch("/installments/overdue", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  console.log("🔵 OVERDUE STATUS:", response.status);

  if (!response.ok) {
    const errorMessage = await getErrorMessage(
      response,
      "Error obteniendo cuotas vencidas",
    );

    console.error("🔴 OVERDUE ERROR:", errorMessage);

    throw new Error(errorMessage);
  }

  const data = await getResponseData<Installment[] | { data?: Installment[] }>(
    response,
  );

  console.log("🔵 OVERDUE RESPONSE:", data);

  console.log("🔵 OVERDUE IS ARRAY:", Array.isArray(data));

  if (Array.isArray(data)) {
    console.log("🔵 OVERDUE COUNT:", data.length);

    if (data.length > 0) {
      console.log("🔵 FIRST OVERDUE:", data[0]);
    }

    return data;
  }

  console.warn("🟡 OVERDUE RESPONSE NO ES ARRAY:", data);

  return [];
}

/**
 * ============================================================
 * GET INSTALLMENTS BY SALE
 * ============================================================
 */

export async function getInstallmentsBySale(
  saleId: string,
): Promise<Installment[]> {
  const token = getToken();

  const response = await apiFetch(`/installments/sale/${saleId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  console.log("🔵 INSTALLMENTS BY SALE STATUS:", response.status);

  if (!response.ok) {
    const errorMessage = await getErrorMessage(
      response,
      "Error obteniendo cuotas de la venta",
    );

    console.error("🔴 INSTALLMENTS BY SALE ERROR:", errorMessage);

    throw new Error(errorMessage);
  }

  const data = await getResponseData<Installment[] | { data?: Installment[] }>(
    response,
  );

  return Array.isArray(data) ? data : [];
}

/**
 * ============================================================
 * GET INSTALLMENTS BY CLIENT
 * ============================================================
 */

export async function getInstallmentsByClient(
  clientId: string,
): Promise<Installment[]> {
  const token = getToken();

  const response = await apiFetch(`/installments/client/${clientId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  console.log("🔵 INSTALLMENTS BY CLIENT STATUS:", response.status);

  if (!response.ok) {
    const errorMessage = await getErrorMessage(
      response,
      "Error obteniendo cuotas del cliente",
    );

    console.error("🔴 INSTALLMENTS BY CLIENT ERROR:", errorMessage);

    throw new Error(errorMessage);
  }

  const data = await getResponseData<Installment[] | { data?: Installment[] }>(
    response,
  );

  return Array.isArray(data) ? data : [];
}

/**
 * ============================================================
 * PAY INSTALLMENT
 * ============================================================
 */

export async function payInstallment(
  installmentId: string,
  payload: PayInstallmentPayload,
): Promise<void> {
  const token = getToken();

  const response = await apiFetch(`/installments/${installmentId}/pay`, {
    method: "PATCH",

    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },

    body: JSON.stringify(payload),
  });

  console.log("🔵 PAY INSTALLMENT STATUS:", response.status);

  if (!response.ok) {
    const errorMessage = await getErrorMessage(
      response,
      "Error registrando el pago de la cuota",
    );

    console.error("🔴 PAY INSTALLMENT ERROR:", errorMessage);

    throw new Error(errorMessage);
  }
}
