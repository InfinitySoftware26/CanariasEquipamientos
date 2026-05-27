"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { loginRequest } from "@/services/auth.service";

export function LoginForm() {
  const router = useRouter();

  const setAuth = useAuthStore((state) => state.setAuth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const data = await loginRequest({
        email,
        password,
      });

      setAuth(data);

      router.push("/dashboard");
    } catch (err) {
      setError("Email o contraseña incorrectos");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md rounded-[32px] border border-white/10 bg-white/10 p-8 backdrop-blur-xl"
    >
      <div className="mb-8">
        <h2 className="text-3xl font-black text-white">Iniciar sesión</h2>

        <p className="mt-2 text-white/60">Accedé al panel administrativo</p>
      </div>

      <div className="space-y-5">
        <div>
          <label className="mb-2 block text-sm text-white/70">Email</label>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@canarias.com"
            className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none transition focus:border-[var(--secondary)]"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm text-white/70">Contraseña</label>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none transition focus:border-[var(--secondary)]"
          />
        </div>

        {error && (
          <div className="rounded-2xl bg-red-500/10 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl bg-[var(--secondary)] py-3 font-bold text-black transition hover:scale-[1.02]"
        >
          {loading ? "Ingresando..." : "Ingresar"}
        </button>
      </div>
    </form>
  );
}
