"use client";

import { CreateStaffPayload } from "@/types/staff/createStaff.type";
import { StaffRole } from "@/types/auth.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface StaffFormProps {
  form: CreateStaffPayload;
  setForm: React.Dispatch<React.SetStateAction<CreateStaffPayload>>;
  handleSubmit: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

export function StaffForm({
  form,
  setForm,
  handleSubmit,
  loading,
  error,
}: StaffFormProps) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
      <h2 className="mb-6 text-2xl font-bold text-white">Nuevo empleado</h2>

      <div className="space-y-5">
        {/* Nombre */}
        <div className="space-y-2">
          <Label>Nombre completo</Label>

          <Input
            placeholder="Ingrese el nombre"
            value={form.name}
            onChange={(e) =>
              setForm({
                ...form,
                name: e.target.value,
              })
            }
            className="h-11 border-white/10 bg-white/5 text-white"
          />
        </div>

        {/* DNI */}
        <div className="space-y-2">
          <Label>DNI</Label>

          <Input
            placeholder="Ingrese el DNI"
            value={form.dni}
            onChange={(e) =>
              setForm({
                ...form,
                dni: e.target.value,
              })
            }
            className="h-11 border-white/10 bg-white/5 text-white"
          />
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label>Email</Label>

          <Input
            type="email"
            placeholder="correo@empresa.com"
            value={form.email}
            onChange={(e) =>
              setForm({
                ...form,
                email: e.target.value,
              })
            }
            className="h-11 border-white/10 bg-white/5 text-white"
          />
        </div>

        {/* Password */}
        <div className="space-y-2">
          <Label>Contraseña temporal</Label>

          <Input
            type="password"
            placeholder="********"
            value={form.password}
            onChange={(e) =>
              setForm({
                ...form,
                password: e.target.value,
              })
            }
            className="h-11 border-white/10 bg-white/5 text-white"
          />
        </div>

        {/* Rol */}
        <div className="space-y-2">
          <Label>Rol</Label>

          <Select
            value={form.role}
            onValueChange={(value) =>
              setForm({
                ...form,
                role: value as StaffRole,
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccione un rol" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value={StaffRole.ADMIN}>Administrador</SelectItem>

              <SelectItem value={StaffRole.SELLER}>Vendedor</SelectItem>

              <SelectItem value={StaffRole.COLLECTOR}>Cobrador</SelectItem>

              <SelectItem value={StaffRole.MANAGER}>Gerente</SelectItem>
            </SelectContent>
          </Select>
        </div>

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
