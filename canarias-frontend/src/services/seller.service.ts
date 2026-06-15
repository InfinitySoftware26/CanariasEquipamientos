const API_URL =
  process.env.NODE_ENV === "production"
    ? "https://canarias-backend.onrender.com/api/v1"
    : (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1");

export async function getSellerDashboard() {
  const res = await fetch(`${API_URL}/dashboard/seller`, {
    credentials: "include",
    cache: "no-store",
  });

  if (!res.ok) throw new Error("Error al obtener datos del dashboard");

  return res.json();
}
