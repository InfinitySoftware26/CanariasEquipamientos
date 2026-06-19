import { LoginPayload } from "@/types/auth.types";
import { apiFetch } from "./apiFetch.service";

export async function loginRequest(data: LoginPayload) {
  const response = await apiFetch("/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Credenciales inválidas");
  }

  const json = await response.json();
  return json.data;
}

export async function logoutRequest(accessToken: string) {
  await apiFetch("/auth/logout", {
    method: "POST",
    credentials: "include",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function refreshTokenRequest(accessToken: string) {
  const response = await apiFetch("/auth/refresh", {
    method: "POST",
    credentials: "include",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("Refresh token inválido");
  }

  return response.json();
}

export async function getProfile(accessToken: string) {
  const response = await apiFetch("/staff/me", {
    credentials: "include",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("No se pudo obtener el perfil");
  }

  return response.json();
}

export async function selectSocietyRequest(
  societyId: string,
  accessToken: string,
) {
  const response = await apiFetch("/auth/select-society", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ societyId }),
  });
  if (!response.ok) {
    const errorText = await response.text();

    console.error("select-society error:", {
      status: response.status,
      errorText,
    });

    throw new Error(errorText);
  }

  const json = await response.json();

  return json.data ?? json;
}
