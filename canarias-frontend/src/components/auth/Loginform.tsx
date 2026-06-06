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

      const data = await loginRequest({
        email,
        password,
      });

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
    <div className="mx-auto w-full max-w-md px-2 sm:px-0">
      {/* LOGO */}

      <div className="mb-6 text-center">
        <Image
          src="/LogoCanariasBlue.png"
          alt="Canarias Equipamientos"
          width={280}
          height={140}
          className="
      mx-auto
      w-[220px]
      sm:w-[260px]
      md:w-[300px]
      h-auto
    "
          priority
        />
      </div>
      <h2
        className="mt-1 mb-8 font-semibold text-xl text-center text-[#ffffff]/80"
        style={{
          textShadow: "0 5px 10px rgba(0, 0, 0, 0.5)",
        }}
      >
        Sistema de Control Comercial
      </h2>
      {/* CARD */}

      <div
        className="
    rounded-3xl
    border
    border-white/10
    bg-[#0A2E4E]/90
    p-6
    backdrop-blur-xl
  "
      >
        <div className="mb-6">
          <h2
            className="text-xl font-semibold text-[#ffa408]"
            style={{
              textShadow: "0 2px 8px rgba(0, 0, 0, 0.5)",
            }}
          >
            Iniciar sesión
          </h2>

          <p className="mt-2 text-left text-white/80">
            Ingresá con tus credenciales corporativas
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              className="mb-2 block text-left font-semibold text-[#ffa408]"
              style={{
                textShadow: "0 2px 8px rgba(0, 0, 0, 0.5)",
              }}
            >
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
                focus:border-[#ffa408]
              "
            />
          </div>

          <div className="relative">
            <label
              className="mb-2 block text-left font-semibold text-[#ffa408]"
              style={{
                textShadow: "0 2px 8px rgba(0, 0, 0, 0.5)",
              }}
            >
              Contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
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
      pr-12
      text-white
      outline-none
      transition
      focus:border-[#ffa408]
    "
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="
      absolute
      right-3
      top-1/2
      -translate-y-1/2
      text-white/40
      transition
      hover:text-white/80
    "
              >
                {showPassword ? (
                  <EyeOff size={18} color="grey" />
                ) : (
                  <Eye size={18} color="grey" />
                )}
              </button>
            </div>

            {error && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
                {error}
              </div>
            )}
          </div>
          <button
            type="button"
            className="text-left text-white/80"
            onClick={() =>
              alert("Contacte al administrador para restablecer su contraseña.")
            }
          >
            ¿Olvidaste tu contraseña?
          </button>

          <button
            type="submit"
            disabled={loading}
            className="
              w-full
              rounded-xl
              bg-[#ffa408]
              py-2
              font-semibold
              text-lg
              text-black
              transition
              hover:opacity-90
            "
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
      </div>

      <p
        className="mt-4 text-center text-[#ffffff]/80"
        style={{
          textShadow: "0 5px 10px rgba(0, 0, 0, 0.5)",
        }}
      >
        Canarias Equipamientos © 2026
      </p>
    </div>
  );
}
