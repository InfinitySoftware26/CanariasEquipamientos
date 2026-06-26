import { MapPin } from "lucide-react";
import { StepTitle } from "./StepTitle";
import { StepClientDataProps } from "@/types/preload-sale/preload.type";

export function StepClientData({ form, setForm }: StepClientDataProps) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
      <StepTitle icon={<MapPin size={18} />} label="Datos del cliente" />

      <div className="space-y-4">
        <input
          className="input"
          placeholder="Nombre"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <input
          className="input"
          placeholder="Apellido"
          value={form.surname}
          onChange={(e) => setForm({ ...form, surname: e.target.value })}
        />

        <input
          className="input"
          placeholder="Teléfono"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />

        <input
          className="input"
          placeholder="Dirección"
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
        />
      </div>
    </section>
  );
}
