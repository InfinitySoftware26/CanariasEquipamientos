"use client";

import { Menu } from "lucide-react";
import { useRouter } from "next/navigation";

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
  const selectedSociety = useAuthStore((state) => state.selectedSociety);
  const router = useRouter();

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
        bg-[#0D1B33]/70
        px-4
        backdrop-blur-xl
        lg:px-8
      "
    >
      {/* IZQUIERDA */}

      <div className="flex items-center gap-3">
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
        <button
          type="button"
          onClick={() => router.push("/select-society")}
          className="group hidden rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-left transition-all hover:border-[#ffa408]/40 hover:bg-[#ffa408]/10 sm:block"
        >
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-[#ffa408]" />
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-white transition-colors group-hover:text-[#ffa408]">
                {selectedSociety?.name ?? "Seleccionar sociedad"}
              </p>
              <p className="truncate text-[10px] uppercase tracking-[0.2em] text-white/50">
                {selectedSociety?.name ? "Sociedad activa" : "Cambiar"}
              </p>
            </div>
          </div>
        </button>
      </div>

      {/* DERECHA */}

      <div className="flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium text-white">{user?.name}</p>

          <p className="text-sm font-semibold text-white/50">
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
            bg-[#ffa408]
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
