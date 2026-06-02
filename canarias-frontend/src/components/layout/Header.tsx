"use client";

import { Menu } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { Sidebar } from "./Sidebar";
import { useAuthStore } from "@/store/auth.store";

const roleLabels = {
  super_admin: "Super Administrador",
  gerente: "Gerente",
  administrativo: "Administrativo",
  vendedor: "Vendedor",
  cobrador: "Cobrador",
};

export function Header() {
  const user = useAuthStore((state) => state.user);

  return (
    <header
      className="
        sticky
        top-0
        z-30
        flex
        h-16
        items-center
        justify-between
        border-b
        border-white/10
        bg-[#050B14]/90
        px-4
        backdrop-blur-xl
        lg:px-8
      "
    >
      {/* IZQUIERDA */}

      <div className="flex items-center gap-3">
        {/* MOBILE MENU */}

        <div className="lg:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <button
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-white/10
                  bg-white/5
                  transition
                  hover:bg-white/10
                "
              >
                <Menu size={20} />
              </button>
            </SheetTrigger>

            <SheetContent
              side="left"
              className="
    w-72
    border-none
    bg-transparent
    p-0
  "
            >
              <SheetTitle className="sr-only">Menú principal</SheetTitle>

              <Sidebar />
            </SheetContent>
          </Sheet>
        </div>

        <div>
          <h1 className="text-xs uppercase tracking-wide text-white/40">
            Bienvenido
          </h1>

          <p className="font-medium text-white">{user?.name ?? "Usuario"}</p>
        </div>
      </div>

      {/* DERECHA */}

      <div className="flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium text-white">{user?.name}</p>

          <p className="text-xs text-white/50">
            {user?.role ? roleLabels[user.role] : ""}
          </p>
        </div>

        <div
          className="
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-full
            bg-[#F5A300]
            text-sm
            font-semibold
            text-black
          "
        >
          {user?.name?.charAt(0).toUpperCase() ?? "U"}
        </div>
      </div>
    </header>
  );
}
