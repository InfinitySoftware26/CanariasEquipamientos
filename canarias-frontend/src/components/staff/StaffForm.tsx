"use client";

import { useState } from "react";
import { CreateStaffPayload } from "@/types/staff/createStaff.type";

import { SaveButton } from "@/components/button/SaveButton";
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
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

type StaffFormData = Pick<
  CreateStaffPayload,
  "name" | "dni" | "phone" | "email" | "role" | "password"
> & {
  societyId?: string;
};

interface StaffFormProps<T extends StaffFormData> {
  form: T;

  updateField: <K extends keyof T>(field: K, value: T[K]) => void;

  handleSubmit: () => Promise<void>;

  loading: boolean;

  error: string | null;

  errors: StaffValidationErrors;

  mode: "create" | "edit";

  title?: string;

  submitLabel?: string;
}

export function StaffForm<T extends StaffFormData>({
  form,
  updateField,
  loading,
  error,
  errors,
  handleSubmit,
  mode = "create",
}: StaffFormProps<T>) {
  const { activeRole } = useAuthStore();

  const availableRoles = getCreatableRoles(activeRole);

  const title = mode === "create" ? "Nuevo empleado" : "Editar empleado";

  const submitLabel = mode === "create" ? "Crear empleado" : "Guardar cambios";

  const [openConfirm, setOpenConfirm] = useState(false);

  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
      <h2 className="mb-6 text-2xl font-bold text-white">{title}</h2>

      <div className="space-y-5">
        <FormField label="Nombre completo" error={errors.name}>
          <Input
            placeholder="Ingrese el nombre"
            value={form.name}
            onChange={(e) => updateField("name", e.target.value as T["name"])}
            className="h-11 border-white/10 bg-white/5 text-white"
          />
        </FormField>

        <FormField label="DNI" error={errors.dni}>
          <Input
            placeholder="Ingrese el DNI"
            value={form.dni}
            onChange={(e) => updateField("dni", e.target.value as T["dni"])}
            className="h-11 border-white/10 bg-white/5 text-white"
          />
        </FormField>

        <FormField label="Teléfono" error={errors.phone}>
          <Input
            type="tel"
            placeholder="Ej: 2994123456"
            value={form.phone}
            onChange={(e) => updateField("phone", e.target.value as T["phone"])}
            className="h-11 border-white/10 bg-white/5 text-white"
          />
        </FormField>

        <FormField label="Email" error={errors.email}>
          <Input
            type="email"
            placeholder="correo@empresa.com"
            value={form.email}
            onChange={(e) => updateField("email", e.target.value as T["email"])}
            className="h-11 border-white/10 bg-white/5 text-white"
          />
        </FormField>

        {mode === "create" && (
          <FormField label="Contraseña temporal" error={errors.password}>
            <Input
              type="password"
              placeholder="********"
              value={form.password ?? ""}
              onChange={(e) =>
                updateField("password", e.target.value as T["password"])
              }
              className="h-11 border-white/10 bg-white/5 text-white"
            />
          </FormField>
        )}

        <FormField label="Rol" error={errors.role}>
          <Select
            value={form.role}
            onValueChange={(value) => updateField("role", value as T["role"])}
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

        {error && (
          <p className="rounded-lg bg-red-500/10 p-3 text-sm text-red-400">
            {error}
          </p>
        )}

        <SaveButton
          onClick={() => setOpenConfirm(true)}
          disabled={loading}
          className="mt-4 w-full"
        >
          {loading ? "Guardando..." : submitLabel}
        </SaveButton>

        <ConfirmDialog
          open={openConfirm}
          onOpenChange={setOpenConfirm}
          title={
            mode === "create" ? "¿Crear nuevo empleado?" : "¿Guardar cambios?"
          }
          description={
            mode === "create"
              ? "Se creará un nuevo registro de empleado en el sistema."
              : "Se guardarán los cambios realizados en la información del empleado."
          }
          confirmText={submitLabel}
          cancelText="Cancelar"
          loading={loading}
          onConfirm={handleSubmit}
        />
      </div>
    </section>
  );
}
