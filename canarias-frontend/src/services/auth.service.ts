import { LoginPayload } from "@/types/auth.types";

const API_URL =
  process.env.NODE_ENV === "production"
    ? "https://canarias-backend.onrender.com/api/v1"
    : (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1");

export async function loginRequest(data: LoginPayload) {
  const response = await fetch(`${API_URL}/auth/login`, {
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

export async function logoutRequest() {
  await fetch(`${API_URL}/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
}

export async function refreshTokenRequest() {
  const response = await fetch(`${API_URL}/auth/refresh`, {
    method: "POST",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Refresh token inválido");
  }

  return response.json();
}

export async function getProfile() {
  const response = await fetch(`${API_URL}/staff/me`, {
    credentials: "include",
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
  const response = await fetch(`${API_URL}/auth/select-society`, {
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
