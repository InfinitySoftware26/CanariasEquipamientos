import { useAuthStore } from "@/store/auth.store";
import { apiFetch } from "../apiFetch.service";
import { Installment, PayInstallmentPayload } from "@/types/installments/installment.types";

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

export async function getOverdueInstallments(): Promise<Installment[]> {
  const token = getToken();

  const response = await apiFetch("/installments/overdue", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Error obteniendo cuotas vencidas"),
    );
  }

  const data = await getResponseData<Installment[] | { data?: Installment[] }>(
    response,
  );

  return Array.isArray(data) ? data : [];
}

export async function getInstallmentsBySale(
  saleId: string,
): Promise<Installment[]> {
  const token = getToken();

  const response = await apiFetch(`/installments/sale/${saleId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Error obteniendo cuotas de la venta"),
    );
  }

  const data = await getResponseData<Installment[] | { data?: Installment[] }>(
    response,
  );

  return Array.isArray(data) ? data : [];
}

export async function getInstallmentsByClient(
  clientId: string,
): Promise<Installment[]> {
  const token = getToken();

  const response = await apiFetch(`/installments/client/${clientId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Error obteniendo cuotas del cliente"),
    );
  }

  const data = await getResponseData<Installment[] | { data?: Installment[] }>(
    response,
  );

  return Array.isArray(data) ? data : [];
}

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

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Error registrando el pago de la cuota"),
    );
  }
}
