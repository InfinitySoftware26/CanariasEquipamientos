"use client";

import { useState } from "react";
import { StaffRole } from "@/types/auth.types";
import { Label } from "@/components/ui/label";

interface StaffRoleSelectProps {
  value: StaffRole;
  onChange: (role: StaffRole) => void;
}

type RoleOption = {
  label: string;
  value: StaffRole;
};

const roleOptions: RoleOption[] = [
  {
    label: "Administrador",
    value: StaffRole.ADMIN,
  },
  {
    label: "Gerente",
    value: StaffRole.MANAGER,
  },
  {
    label: "Vendedor",
    value: StaffRole.SELLER,
  },
  {
    label: "Cobrador",
    value: StaffRole.COLLECTOR,
  },
];

export function StaffRoleSelect({
  value,
  onChange,
}: StaffRoleSelectProps) {
  const [open, setOpen] = useState(false);

  const selectedRole = roleOptions.find(
    (role) => role.value === value,
  );

  return (
    <div className="space-y-2">

      <Label>Rol</Label>

      <div className="relative">

        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="
            h-11
            w-full
            rounded-xl
            border
            border-white/10
            bg-white/5
            px-4
            text-left
            text-white
            transition
            hover:border-[#F5A300]/60
            focus:border-[#F5A300]
            focus:outline-none
          "
        >
          {selectedRole?.label ?? "Seleccione un rol"}
        </button>

        {open && (
          <div
            className="
              absolute
              z-20
              mt-2
              w-full
              overflow-hidden
              rounded-xl
              border
              border-white/10
              bg-[#0D1B2A]
            "
          >
            {roleOptions.map((role) => (
              <div
                key={role.value}
                onClick={() => {
                  onChange(role.value);
                  setOpen(false);
                }}
                className="
                  cursor-pointer
                  px-4
                  py-3
                  text-white
                  transition
                  hover:bg-white/10
                "
              >
                {role.label}
              </div>
            ))}
          </div>
        )}

      </div>

    </div>
  );
}