const App = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export interface LoginPayload {
  email: string;
  password: string;
}

export async function loginRequest(data: LoginPayload) {
  const response = await fetch(`${App}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Credenciales Invalidas");

  return response.json();
}
