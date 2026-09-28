import { MapPin } from "lucide-react";
import { StepTitle } from "./StepTitle";
import { StepClientDataProps } from "@/types/preload-sale/preload.type";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function StepClientData({ form, setForm, zones }: StepClientDataProps) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
      <StepTitle icon={<MapPin size={18} />} label="Datos del cliente" />

      <div className="grid gap-4 md:grid-cols-2">
        {/* Datos básicos */}
        <Input
          placeholder="Nombre"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="h-11 border-white/10 bg-white/5 text-white"
        />

        <Input
          placeholder="Apellido"
          value={form.surname}
          onChange={(e) => setForm({ ...form, surname: e.target.value })}
          className="h-11 border-white/10 bg-white/5 text-white"
        />

        <Input
          placeholder="Teléfono"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          className="h-11 border-white/10 bg-white/5 text-white"
        />

        <Input
          placeholder="Dirección"
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
          className="h-11 border-white/10 bg-white/5 text-white"
        />

        <Input
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="h-11 border-white/10 bg-white/5 text-white"
        />

        {/* Referencia 1 */}
        <div className="space-y-4 md:col-span-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-wider text-[#F5A300]/80">
              Referencia 1
            </p>
            <p className="mt-1 text-sm text-white/60">
              Datos de la persona de garantía 1.
            </p>

            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <Input
                placeholder="Nombre referencia 1"
                value={form.nameReference1}
                onChange={(e) =>
                  setForm({ ...form, nameReference1: e.target.value })
                }
                className="h-11 border-white/10 bg-white/5 text-white"
              />
              <Input
                placeholder="Domicilio referencia 1"
                value={form.addressReference1}
                onChange={(e) =>
                  setForm({ ...form, addressReference1: e.target.value })
                }
                className="h-11 border-white/10 bg-white/5 text-white"
              />
              <Input
                placeholder="Teléfono referencia 1"
                value={form.telReference1}
                onChange={(e) =>
                  setForm({ ...form, telReference1: e.target.value })
                }
                className="h-11 border-white/10 bg-white/5 text-white"
              />
            </div>
          </div>

          {/* Referencia 2 */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-wider text-[#F5A300]/80">
              Referencia 2
            </p>
            <p className="mt-1 text-sm text-white/60">
              Datos de la persona de garantía 2.
            </p>

            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <Input
                placeholder="Nombre referencia 2"
                value={form.nameReference2}
                onChange={(e) =>
                  setForm({ ...form, nameReference2: e.target.value })
                }
                className="h-11 border-white/10 bg-white/5 text-white"
              />
              <Input
                placeholder="Domicilio referencia 2"
                value={form.addressReference2}
                onChange={(e) =>
                  setForm({ ...form, addressReference2: e.target.value })
                }
                className="h-11 border-white/10 bg-white/5 text-white"
              />
              <Input
                placeholder="Teléfono referencia 2"
                value={form.telReference2}
                onChange={(e) =>
                  setForm({ ...form, telReference2: e.target.value })
                }
                className="h-11 border-white/10 bg-white/5 text-white"
              />
            </div>
          </div>

          {/* Bloque socioeconómico */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-wider text-[#F5A300]/80">
              Datos socioeconómicos
            </p>
            <p className="mt-1 text-sm text-white/60">
              Información adicional del cliente.
            </p>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Input
                placeholder="Profesión"
                value={form.profession}
                onChange={(e) =>
                  setForm({ ...form, profession: e.target.value })
                }
                className="h-11 border-white/10 bg-white/5 text-white"
              />
              <Input
                placeholder="Ingreso mensual"
                value={form.monthlyIncome}
                onChange={(e) =>
                  setForm({ ...form, monthlyIncome: e.target.value })
                }
                className="h-11 border-white/10 bg-white/5 text-white"
              />
              <Input
                placeholder="Modalidad de cobro"
                value={form.paymentMethod}
                onChange={(e) =>
                  setForm({ ...form, paymentMethod: e.target.value })
                }
                className="h-11 border-white/10 bg-white/5 text-white"
              />
              <Input
                placeholder="Personas a cargo"
                value={form.incomeDependents}
                onChange={(e) =>
                  setForm({ ...form, incomeDependents: e.target.value })
                }
                className="h-11 border-white/10 bg-white/5 text-white"
              />
              <Input
                placeholder="Ingreso complementario"
                value={form.additionalIncome}
                onChange={(e) =>
                  setForm({ ...form, additionalIncome: e.target.value })
                }
                className="h-11 border-white/10 bg-white/5 text-white"
              />
              <Input
                placeholder="CUIL"
                value={form.cuil}
                onChange={(e) => setForm({ ...form, cuil: e.target.value })}
                className="h-11 border-white/10 bg-white/5 text-white"
              />
            </div>

            {/* Vivienda */}
            <div className="flex gap-4 mt-4">
              <label className="text-white">
                <input
                  type="radio"
                  checked={form.housingSituation === "Propietario"}
                  onChange={() =>
                    setForm({ ...form, housingSituation: "Propietario" })
                  }
                />
                Propietario
              </label>
              <label className="text-white">
                <input
                  type="radio"
                  checked={form.housingSituation === "Alquila"}
                  onChange={() =>
                    setForm({ ...form, housingSituation: "Alquila" })
                  }
                />
                Alquila
              </label>
            </div>

            {form.housingSituation === "Alquila" && (
              <Input
                placeholder="Tiempo de contrato"
                value={form.contractDuration}
                onChange={(e) =>
                  setForm({ ...form, contractDuration: e.target.value })
                }
                className="h-11 border-white/10 bg-white/5 text-white mt-2"
              />
            )}

            {/* Crédito activo */}
            <label className="text-white flex items-center gap-2 mt-4">
              <input
                type="checkbox"
                checked={form.activeCredit || false}
                onChange={(e) =>
                  setForm({ ...form, activeCredit: e.target.checked })
                }
              />
              ¿Cuenta con crédito activo?
            </label>
          </div>
        </div>

        {/* Zona */}
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm text-white/60">Zona</label>
          <Select
            value={form.zoneId}
            onValueChange={(value) => setForm({ ...form, zoneId: value })}
          >
            <SelectTrigger className="w-full border-white/10 bg-white/5 text-white">
              <SelectValue placeholder="Seleccionar zona" />
            </SelectTrigger>
            <SelectContent>
              {zones.map((zone) => (
                <SelectItem key={zone.zoneId} value={zone.zoneId}>
                  {zone.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {/* Observaciones */}
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm text-white/60">Observaciones</label>
          <Input
            placeholder="Observaciones del cliente"
            value={form.observations}
            onChange={(e) => setForm({ ...form, observations: e.target.value })}
            className="h-11 border-white/10 bg-white/5 text-white"
          />
        </div>
      </div>
    </section>
  );
}
