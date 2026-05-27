import Link from "next/link";

export default function HomePage() {
  return (
    <main className="relative flex min-h-screen overflow-hidden">
      {/* BACKGROUND */}
      <div className="absolute inset-0 gradient-primary opacity-95" />

      {/* DECORATION */}
      <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-[var(--secondary)]/20 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full bg-white/10 blur-3xl" />

      {/* CONTENT */}
      <section className="container-page relative z-10 flex flex-1 items-center justify-center">
        <div className="grid w-full max-w-7xl gap-12 lg:grid-cols-2">
          {/* LEFT */}
          <div className="flex flex-col justify-center">
            {/* LOGO */}
            <div className="mb-8 flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white">
                <span className="text-3xl font-black text-[var(--primary)]">
                  C
                </span>
              </div>

              <div>
                <h1 className="text-5xl font-black tracking-tight text-white">
                  CANARIAS
                </h1>

                <p className="mt-1 text-sm uppercase tracking-[0.4em] text-white/70">
                  Equipamientos
                </p>
              </div>
            </div>

            {/* TEXT */}
            <div className="max-w-xl">
              <h2 className="text-4xl font-bold leading-tight text-white lg:text-6xl">
                Plataforma de gestión empresarial moderna
              </h2>

              <p className="mt-6 text-lg leading-relaxed text-white/80">
                Administración de clientes, cuotas, balances, empleados y
                cobranzas en una sola plataforma.
              </p>
            </div>

            {/* ACTIONS */}
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/login"
                className="rounded-2xl bg-[var(--secondary)] px-8 py-4 text-lg font-semibold text-black transition hover:scale-[1.02]"
              >
                Iniciar sesión
              </Link>

              <button className="rounded-2xl border border-white/20 bg-white/10 px-8 py-4 text-lg font-semibold text-white backdrop-blur transition hover:bg-white/20">
                Conocer más
              </button>
            </div>

            {/* FEATURES */}
            <div className="mt-14 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur">
                <p className="text-3xl font-black text-white">24/7</p>

                <span className="mt-2 block text-sm text-white/70">
                  Gestión online
                </span>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur">
                <p className="text-3xl font-black text-white">100%</p>

                <span className="mt-2 block text-sm text-white/70">
                  Roles integrados
                </span>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur">
                <p className="text-3xl font-black text-white">+Control</p>

                <span className="mt-2 block text-sm text-white/70">
                  Cobros y balances
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="hidden items-center justify-center lg:flex">
            <div className="card-base w-full max-w-xl rounded-[32px] border-white/10 bg-blue-900/40 p-8 backdrop-blur-xl">
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/60">Panel Administrativo</p>

                  <h3 className="mt-1 text-2xl font-bold text-white">
                    Dashboard General
                  </h3>
                </div>

                <div className="h-4 w-4 rounded-full bg-green-400" />
              </div>

              <div className="space-y-5">
                <div className="rounded-2xl bg-white/10 p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">Cobros del mes</span>

                    <span className="text-2xl font-black text-white">
                      $4.2M
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div className="rounded-2xl bg-white/10 p-5">
                    <p className="text-sm text-white/60">Clientes activos</p>

                    <h4 className="mt-3 text-3xl font-black text-white">248</h4>
                  </div>

                  <div className="rounded-2xl bg-white/10 p-5">
                    <p className="text-sm text-white/60">Empleados</p>

                    <h4 className="mt-3 text-3xl font-black text-white">18</h4>
                  </div>
                </div>

                <div className="rounded-2xl bg-white/10 p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-white/70">Estado financiero</span>

                    <span className="text-sm font-semibold text-green-300">
                      Estable
                    </span>
                  </div>

                  <div className="h-3 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full w-[72%] rounded-full bg-[var(--secondary)]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
