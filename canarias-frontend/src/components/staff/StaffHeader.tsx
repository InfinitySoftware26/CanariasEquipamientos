"use client";

import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";

export function StaffHeader() {
  const router = useRouter();

  return (
    <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-4xl font-bold text-[#F5A300]">Empleados</h1>

        <p className="mt-2 text-white/70">
          Administración del personal de la sociedad.
        </p>
      </div>

      <Button
        size="lg"
        onClick={() => router.push("/staff/create")}
        className="
          bg-[#F5A300]
          text-[#0D1B2A]
          hover:bg-[#ffb82c]
          font-semibold
          px-6
        "
      >
        <UserPlus className="mr-2 h-5 w-5" />
        Agregar empleado
      </Button>
    </div>
  );
}
