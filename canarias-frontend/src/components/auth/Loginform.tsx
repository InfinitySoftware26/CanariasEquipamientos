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
    } catch {
      setError("Credenciales incorrectas");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md">
      {/* LOGO */}

      <div className="mb-10 text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
          <span className="text-3xl font-bold text-white">C</span>
        </div>

        <h1 className="text-3xl font-semibold tracking-tight text-white">
          CANARIAS
        </h1>

        <p className="mt-2 text-sm text-white/50">Control Comercial</p>
      </div>

      {/* CARD */}

      <div
        className="
          rounded-3xl
          border
          border-white/10
          bg-white/[0.03]
          p-6
          backdrop-blur-xl
        "
      >
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-white">Iniciar sesión</h2>

          <p className="mt-2 text-sm text-white/50">
            Ingresá con tus credenciales corporativas
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm text-white/70">
              Correo electrónico
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@canarias.com"
              className="
                w-full
                rounded-xl
                border
                border-white/10
                bg-white/[0.03]
                px-4
                py-3
                text-white
                outline-none
                transition
                focus:border-[#F5A300]
              "
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-white/70">
              Contraseña
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="
                w-full
                rounded-xl
                border
                border-white/10
                bg-white/[0.03]
                px-4
                py-3
                text-white
                outline-none
                transition
                focus:border-[#F5A300]
              "
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="
              w-full
              rounded-xl
              bg-[#F5A300]
              py-3
              font-semibold
              text-black
              transition
              hover:opacity-90
            "
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
      </div>

      <p className="mt-6 text-center text-xs text-white/30">
        Canarias Equipamientos © 2026
      </p>
    </div>
  );
}
