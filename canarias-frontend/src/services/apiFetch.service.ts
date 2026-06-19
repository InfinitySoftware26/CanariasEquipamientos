import { useAuthStore } from "@/store/auth.store";

const API_URL =
  process.env.NODE_ENV === "production"
    ? "https://canarias-backend.onrender.com/api/v1"
    : (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1");

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = useAuthStore.getState().accessToken;

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
      ...options.headers,
    },
  });

  // 👇 CLAVE: manejo global de sesión expirada
  if (response.status === 401) {
    const { logout } = useAuthStore.getState();

    logout(); // limpia store

    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }

    throw new Error("SESSION_EXPIRED");
  }

  return response;
}
