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
        </div>

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
              {zones.length === 0 ? (
                <SelectItem value="" className="text-white/70">
                  No hay zonas activas
                </SelectItem>
              ) : (
                zones.map((zone) => (
                  <SelectItem key={zone.zoneId} value={zone.zoneId}>
                    {zone.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      </div>
    </section>
  );
}
