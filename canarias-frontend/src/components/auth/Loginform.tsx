"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

import { useAuthStore } from "@/store/auth.store";
import { loginRequest } from "@/services/auth.service";
import { getDashboardRoute } from "@/lib/redirection-role";
import Image from "next/image";

export function LoginForm() {
  const router = useRouter();

  const setAuth = useAuthStore((state) => state.setAuth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const data = await loginRequest({ email, password });

      setAuth({
        user: data.user,
        accessToken: data.accessToken,
      });

      router.replace(getDashboardRoute(data.user.role));
    } catch {
      setError("Credenciales incorrectas");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      {/* LOGO (integrado estilo dashboard card) */}
      <div className="flex flex-col items-center text-center space-y-2">
        <Image
          src="/LogoCanariasBlue.png"
          alt="Canarias Equipamientos"
          width={260}
          height={140}
          className="h-auto rounded-lg w-[220px]"
          priority
        />

        <p className="text-center font-semibold mt-3 text-white/70">
          Sistema de gestión comercial
        </p>
        <div className="h-px w-40 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </div>

      {/* FORM CARD */}
      <div className="card-base bg-white/5 backdrop-blur-xl p-8">
        <h2 className="text-xl font-semibold text-[#ffa408]">Iniciar sesión</h2>

        <p className="mt-2 text-sm text-white/80">
          Ingresá con tus credenciales corporativas
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {/* EMAIL */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-white/100">
              Correo electrónico
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@canarias.com"
              className="w-full"
            />
          </div>

          {/* PASSWORD */}
          <div className="relative">
            <label className="mb-2 block text-sm font-semibold text-white/100">
              Contraseña
            </label>

            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pr-12"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-10 text-white/40 hover:text-white/80"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* ERROR */}
          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {/* FORGOT */}
          <button
            type="button"
            className="text-sm font-semibold text-white/100 hover:text-white"
            onClick={() =>
              alert("Contacte al administrador para restablecer su contraseña.")
            }
          >
            ¿Olvidaste tu contraseña?
          </button>

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#ffa408] py-3 font-semibold text-black transition hover:opacity-90"
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
      </div>

      {/* FOOTER */}
      <p className="text-center font-semibold mt-3 text-white/60">
        Canarias Equipamientos © 2026
      </p>
    </div>
  );
}
