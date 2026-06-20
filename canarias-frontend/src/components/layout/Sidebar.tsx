"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { navigationByRole } from "@/lib/navigation";
import { useAuthStore } from "@/store/auth.store";
import { logoutRequest } from "@/services/auth.service";
import Image from "next/image";

const roleLabels = {
  super_admin: "Super Administrador",
  gerente: "Gerente",
  administrativo: "Administrativo",
  vendedor: "Vendedor",
  cobrador: "Cobrador",
};

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const accessToken = useAuthStore((state) => state.accessToken);

  if (!user) return null;

  const links = navigationByRole[user.role] ?? [];

  const handleLogout = async () => {
    try {
      if (accessToken) {
        await logoutRequest(accessToken);
      }
    } catch (error) {
      console.error(error);
    }

    logout();

    router.replace("/login");
  };

  return (
    <aside
      className="
    fixed
    left-0
    top-0
    z-40
    flex
    h-screen
    w-72
    flex-col
    border-r
    border-white/10

    bg-gradient-to-b
    from-[#075087]
    via-[#0A3F69]
    to-[#072B4A]
  "
    >
      {/* LOGO */}

      <div className="border-b border-white/10 p-6">
        <div
          className="
      mx-auto
      flex
      w-fit
      items-center
      justify-center
      rounded-2xl
      bg-white
      p-3
      shadow-lg
      shadow-black/20
    "
        >
          <Image
            src="/LogoCanariasWhite.png"
            alt="Canarias Equipamientos"
            width={180}
            height={90}
            className="h-auto w-40"
            priority
          />
        </div>

        <p className="mt-4 text-center text-sm font-semibold text-white/80">
          Sistema Comercial
        </p>
        <div className="mx-auto mt-4 h-px w-24 bg-gradient-to-r from-transparent via-[#ffa408] to-transparent" />
      </div>
      {/* USUARIO */}

      <div className="border-b border-white/10 p-6">
        <h2 className="truncate font-medium text-white">{user.name}</h2>

        <p className="mt-1 text-sm text-white/50">{roleLabels[user.role]}</p>
      </div>

      {/* NAVEGACIÓN */}

      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-2">
          {links.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`
                    flex
                    items-center
                    rounded-xl
                    px-4
                    py-3
                    text-sm
                    font-medium
                    transition-all

                    ${
                      active
                        ? "bg-[#ffa408] text-black font-semibold"
                        : "text-white/70 hover:bg-white/10 hover:text-white"
                    }
                  `}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* FOOTER */}

      <div className="border-t border-white/10 p-4">
        <button
          onClick={handleLogout}
          className="
            w-full
            rounded-xl
            border
            border-red-500/20
            bg-red-500/10
            py-3
            text-sm
            font-medium
            text-red-300
            transition-all
            hover:bg-red-500/20
          "
        >
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
