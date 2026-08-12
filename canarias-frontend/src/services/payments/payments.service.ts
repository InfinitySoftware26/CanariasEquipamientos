import { useAuthStore } from "@/store/auth.store";
import { apiFetch } from "../apiFetch.service";
import {
  ApplyPaymentPayload,
  CreatePaymentPayload,
  Payment,
  PaymentApplication,
  PaymentFilters,
} from "@/types/payments/payment.types";

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

export async function getPayments(query?: PaymentFilters): Promise<Payment[]> {
  const token = getToken();
  const params = new URLSearchParams();

  if (query?.saleId) params.append("saleId", query.saleId);
  if (query?.clientId) params.append("clientId", query.clientId);
  if (query?.staffId) params.append("staffId", query.staffId);
  if (query?.from) params.append("from", query.from);
  if (query?.to) params.append("to", query.to);

  const queryString = params.toString();
  const endpoint = queryString ? `/payments?${queryString}` : "/payments";

  const response = await apiFetch(endpoint, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response, "Error obteniendo pagos"));
  }

  const data = await getResponseData<Payment[] | { data?: Payment[] }>(
    response,
  );

  return Array.isArray(data) ? data : [];
}

export async function getPayment(id: string): Promise<Payment> {
  const token = getToken();

  const response = await apiFetch(`/payments/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response, "Error obteniendo pago"));
  }

  return getResponseData<Payment>(response);
}

export async function createPayment(
  payload: CreatePaymentPayload,
): Promise<Payment> {
  const token = getToken();

  const response = await apiFetch("/payments", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response, "Error registrando pago"));
  }

  return getResponseData<Payment>(response);
}

export async function getPaymentApplications(
  paymentId: string,
): Promise<PaymentApplication[]> {
  const token = getToken();

  const response = await apiFetch(`/payments/${paymentId}/applications`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Error obteniendo imputaciones"),
    );
  }

  const data = await getResponseData<PaymentApplication[]>(response);

  return Array.isArray(data) ? data : [];
}

export async function applyPayment(
  paymentId: string,
  payload: ApplyPaymentPayload,
): Promise<void> {
  const token = getToken();

  const response = await apiFetch(`/payments/${paymentId}/applications`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response, "Error imputando pago"));
  }
}
