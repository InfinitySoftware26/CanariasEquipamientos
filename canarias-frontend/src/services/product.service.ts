const API_URL =
  process.env.NODE_ENV === "production"
    ? "https://canarias-backend.onrender.com/api/v1"
    : (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1");

export async function getProducts() {
  const token = localStorage.getItem("token");
  localStorage.getItem("access-token");
  localStorage.getItem("token");
  localStorage.getItem("accessToken");

  if (!token) {
    throw new Error("No hay token de autenticación");
  }

  const res = await fetch(`${API_URL}/products`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Error obteniendo productos: ${text}`);
  }

  return res.json();
}
