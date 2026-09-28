"use client";

import { useAuthStore } from "@/store/auth.store";
import { StaffRole } from "@/types/auth.types";

import { ClosureForm } from "@/components/closures/ClosureForm";

const ALLOWED_ROLES = [
  StaffRole.COLLECTOR,
  StaffRole.ADMIN,
  StaffRole.MANAGER,
  StaffRole.SUPER_ADMIN,
];

export default function NewClosurePage() {
  const activeRole = useAuthStore((state) => state.activeRole);
  const allowed = !!activeRole && ALLOWED_ROLES.includes(activeRole);

  if (!allowed) {
    return (
      <div className="rounded-2xl border border-white/10 bg-[#0E1726] p-8 text-center">
        <p className="text-white/60">
          No tenés permisos para acceder a esta sección.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-bold text-white">
          Declarar cierre diario
        </h1>

        <p className="mt-2 text-white/60">
          Registrá el total cobrado en tu jornada para que administración lo
          valide.
        </p>
      </section>

      <ClosureForm />
    </div>
  );
}
