"use client";

import { CreateStaffPayload } from "@/types/staff/createStaff.type";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/formField";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useAuthStore } from "@/store/auth.store";
import { getCreatableRoles } from "@/permissions/staff.permissions";

import { StaffValidationErrors } from "@/validators/staff.validator";
import { StaffRole } from "@/types/auth.types";

interface StaffFormProps {
  form: CreateStaffPayload;

  updateField: <K extends keyof CreateStaffPayload>(
    field: K,
    value: CreateStaffPayload[K],
  ) => void;

  handleSubmit: () => Promise<void>;

  loading: boolean;
  error: string | null;
  errors: StaffValidationErrors;
}

export function StaffForm({
  form,
  updateField,
  loading,
  error,
  errors,
  handleSubmit,
}: StaffFormProps) {
  const { activeRole } = useAuthStore();

  const availableRoles = getCreatableRoles(activeRole);

  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
      <h2 className="mb-6 text-2xl font-bold text-white">Nuevo empleado</h2>

      <div className="space-y-5">
        <FormField label="Nombre completo" error={errors.name}>
          <Input
            placeholder="Ingrese el nombre"
            value={form.name}
            onChange={(e) => updateField("name", e.target.value)}
            className="h-11 border-white/10 bg-white/5 text-white"
          />
        </FormField>

        <FormField label="DNI" error={errors.dni}>
          <Input
            placeholder="Ingrese el DNI"
            value={form.dni}
            onChange={(e) => updateField("dni", e.target.value)}
            className="h-11 border-white/10 bg-white/5 text-white"
          />
        </FormField>

        <FormField label="Email" error={errors.email}>
          <Input
            type="email"
            placeholder="correo@empresa.com"
            value={form.email}
            onChange={(e) => updateField("email", e.target.value)}
            className="h-11 border-white/10 bg-white/5 text-white"
          />
        </FormField>

        <FormField label="Contraseña temporal" error={errors.password}>
          <Input
            type="password"
            placeholder="********"
            value={form.password}
            onChange={(e) => updateField("password", e.target.value)}
            className="h-11 border-white/10 bg-white/5 text-white"
          />
        </FormField>

        <FormField label="Rol" error={errors.role}>
          <Select
            value={form.role}
            onValueChange={(value) => updateField("role", value as StaffRole)}
          >
            <SelectTrigger className="w-full border-white/10 bg-white/5 text-white">
              <SelectValue placeholder="Seleccione un rol" />
            </SelectTrigger>

            <SelectContent>
              {availableRoles.map((role) => (
                <SelectItem key={role} value={role}>
                  {role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="mt-4 h-12 w-full rounded-xl bg-[#F5A300] font-semibold text-[#0D1B2A] hover:bg-[#e89b00]"
        >
          {loading ? "Creando empleado..." : "Crear empleado"}
        </Button>
      </div>
    </section>
  );
}
