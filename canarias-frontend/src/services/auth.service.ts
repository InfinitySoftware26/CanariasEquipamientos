const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface CreateClientPayload {
  name?: string;
  surname?: string;
  documentNumber?: string;
  phone?: string;
  email?: string;
  address?: string;
}

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

export async function createPreloadClient(data: CreateClientPayload) {
  const res = await fetch(`${API_URL}/clients/preload`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Error creando cliente");

  return res.json();
}

export async function getSellerDashboard() {
  const res = await fetch(`${API_URL}/dashboard/seller`, {
    credentials: "include",
  });

  if (!res.ok) throw new Error("Error dashboard");

  return res.json();
}

export async function createSale(data: any) {
  const res = await fetch(`${API_URL}/sales`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Error creando venta");

  return res.json();
}

export async function getSellerKpis(societyId: string) {
  const res = await fetch(`${API_URL}/sales/dashboard?societyId=${societyId}`, {
    credentials: "include",
  });

  if (!res.ok) throw new Error("Error KPIs");

  return res.json();
}
