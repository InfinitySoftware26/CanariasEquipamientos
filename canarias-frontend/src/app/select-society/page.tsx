"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useAuthStore } from "@/store/auth.store";
import { selectSocietyRequest } from "@/services/auth.service";
import { getDashboardRoute } from "@/lib/redirection-role";

export default function SelectSocietyPage() {
  const router = useRouter();

  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);

  const setSelectedSociety = useAuthStore((state) => state.setSelectedSociety);

  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      router.replace("/login");
    }
  }, [user, router]);

  async function handleSelect(societyId: string) {
    if (!user) return;

    try {
      if (!accessToken) {
        setError("Sesión inválida. Volvé a iniciar sesión.");
        return;
      }

      const selected = user.societies?.find(
        (society) => society.societyId === societyId,
      );

      setError("");
      setLoadingId(societyId);

      const response = await selectSocietyRequest(societyId, accessToken);

      setSelectedSociety(
        societyId,
        selected?.societyName,
        response.accessToken,
      );

      router.replace(getDashboardRoute(user.role));
    } catch {
      setError("No se pudo seleccionar la sociedad.");
    } finally {
      setLoadingId(null);
    }
  }

  useEffect(() => {
    if (!user || !accessToken) return;

    if (user.societies?.length !== 1) return;

    const autoSelect = async () => {
      try {
        const societyId = user.societies[0].societyId;
        const societyName = user.societies[0].societyName;

        const response = await selectSocietyRequest(societyId, accessToken);

        setSelectedSociety(societyId, societyName, response.accessToken);

        router.replace(getDashboardRoute(user.role));
      } catch (error) {
        console.error(error);
        setError(error instanceof Error ? error.message : "Error desconocido");
      }
    };

    autoSelect();
  }, [user, accessToken, router, setSelectedSociety]);

  if (!user) {
    return null;
  }

  const societies = user.societies ?? [];

  return (
    <main
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-6"
      style={{
        background: `
        radial-gradient(
          circle at center,
          #053a66 0%,
          #075087 45%,
          #0b6aa8 100%
        )
      `,
      }}
    >
      <div className="absolute inset-0 bg-grid opacity-20" />

      <div className="absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-[#ffa408]/20 blur-[140px]" />

      <div className="relative z-10 w-full max-w-2xl">
        <div
          className="
          rounded-3xl
          border border-white/10
          bg-[#071C38]/70
          backdrop-blur-xl
          shadow-2xl
          p-8 md:p-10
        "
        >
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white">
              Seleccionar <span className="text-[#F5A300]">Sociedad</span>
            </h1>

            <p className="mt-3 text-white/70">
              Elegí la sociedad a la que querés ingresar
            </p>
          </div>

          {error && (
            <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-300">
              {error}
            </div>
          )}

          <div className="mt-8">
            {societies.length === 0 ? (
              <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-5 text-center text-yellow-300">
                No estás registrado en ninguna sociedad.
                <br />
                Contactá a un administrador.
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {societies.map((society) => (
                  <button
                    key={society.societyId}
                    onClick={() => handleSelect(society.societyId)}
                    disabled={loadingId !== null}
                    className="
                    group
                    w-full
                    rounded-2xl
                    border border-white/10
                    bg-white/5
                    p-5
                    text-left
                    transition-all
                    hover:border-[#F5A300]/40
                    hover:bg-[#F5A300]/10
                    hover:translate-y-[-2px]
                    disabled:opacity-50
                  "
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-lg font-semibold text-white hover:text-[#F5A300]">
                          {society.societyName}
                        </div>

                        <div className="mt-1 text-sm text-white/60">
                          Estado: {society.status}
                        </div>
                      </div>

                      <div className="text-[#F5A300] opacity-0 transition-opacity group-hover:opacity-100">
                        →
                      </div>
                    </div>

                    {loadingId === society.societyId && (
                      <div className="mt-3 text-sm font-medium text-[#F5A300]">
                        Ingresando...
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
