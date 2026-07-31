"use client";

import { useState } from "react";
import { Loader2, Calendar, MapPin, User } from "lucide-react";
import { SaveButton } from "@/components/button/SaveButton";
import { CreateRouteSheetPayload } from "@/types/rotue-sheets/createRouteSheets.type";

interface Option {
  id: string;
  name: string;
}

interface Props {
  zones: Option[];
  collectors: Option[];
  loading?: boolean;
  onSubmit: (data: CreateRouteSheetPayload) => Promise<void>;
}

export function RouteSheetCreateForm({
  zones,
  collectors,
  loading = false,
  onSubmit,
}: Props) {
  const [form, setForm] = useState<CreateRouteSheetPayload>({
    zoneId: "",
    staffId: "",
    routeDate: "",
  });

  function update<K extends keyof CreateRouteSheetPayload>(
    key: K,
    value: CreateRouteSheetPayload[K],
  ) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    await onSubmit(form);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="
        rounded-3xl
        border
        border-white/10
        bg-white/5
        p-6
        space-y-6
      "
    >
      <div>
        <h2 className="text-2xl font-bold">Nueva hoja de ruta</h2>

        <p className="mt-1 text-sm text-white/50">
          Seleccioná la zona, el cobrador y la fecha del recorrido.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm text-white/60">Zona</label>

          <div
            className="
              flex
              items-center
              gap-3
              rounded-2xl
              border
              border-white/10
              bg-black/20
              px-4
            "
          >
            <MapPin size={18} className="text-cyan-400" />

            <select
              required
              value={form.zoneId}
              onChange={(e) => update("zoneId", e.target.value)}
              className="
                h-12
                w-full
                bg-transparent
                outline-none
              "
            >
              <option value="">Seleccionar zona</option>

              {zones.map((zone) => (
                <option key={zone.id} value={zone.id}>
                  {zone.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-white/60">Cobrador</label>

          <div
            className="
              flex
              items-center
              gap-3
              rounded-2xl
              border
              border-white/10
              bg-black/20
              px-4
            "
          >
            <User size={18} className="text-cyan-400" />

            <select
              required
              value={form.staffId}
              onChange={(e) => update("staffId", e.target.value)}
              className="
                h-12
                w-full
                bg-transparent
                outline-none
              "
            >
              <option value="">Seleccionar cobrador</option>

              {collectors.map((collector) => (
                <option key={collector.id} value={collector.id}>
                  {collector.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm text-white/60">Fecha del recorrido</label>

        <div
          className="
            flex
            items-center
            gap-3
            rounded-2xl
            border
            border-white/10
            bg-black/20
            px-4
          "
        >
          <Calendar size={18} className="text-cyan-400" />

          <input
            required
            type="date"
            value={form.routeDate}
            onChange={(e) => update("routeDate", e.target.value)}
            className="
              h-12
              w-full
              bg-transparent
              outline-none
            "
          />
        </div>
      </div>

      <div
        className="
          flex
          justify-end
          gap-3
          pt-3
        "
      >
        <SaveButton
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3"
        >
          {loading && <Loader2 size={18} className="animate-spin" />}
          Crear hoja de ruta
        </SaveButton>
      </div>
    </form>
  );
}
