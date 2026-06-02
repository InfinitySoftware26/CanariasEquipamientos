"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { navigationByRole } from "@/lib/navigation";
import { useAuthStore } from "@/store/auth.store";
import { logoutRequest } from "@/services/auth.service";

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

  if (!user) return null;

  const links = navigationByRole[user.role] ?? [];

  const handleLogout = async () => {
    try {
      await logoutRequest();
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
        bg-[#081220]
      "
    >
      {/* LOGO */}

      <div className="border-b border-white/10 p-6">
        <h1 className="text-xl font-bold text-white">Canarias Equipamientos</h1>

        <p className="mt-1 text-sm text-white/50">Sistema Comercial</p>
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
                        ? "bg-[#F5A300] text-black shadow-md"
                        : "text-white/70 hover:bg-white/5 hover:text-white"
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
