"use client";

import { useState } from "react";

import { Calendar, FileText, Loader2, MapPin, User } from "lucide-react";

import { SaveButton } from "@/components/button/SaveButton";

import { CreateRouteSheetPayload } from "@/types/rotue-sheets/createRouteSheets.type";

// ============================================================
// TYPES
// ============================================================

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

// ============================================================
// COMPONENT
// ============================================================

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

    notes: "",
  });

  const [error, setError] = useState<string | null>(null);

  // ==========================================================
  // UPDATE
  // ==========================================================

  function update<K extends keyof CreateRouteSheetPayload>(
    key: K,
    value: CreateRouteSheetPayload[K],
  ) {
    setForm((prev) => ({
      ...prev,

      [key]: value,
    }));

    if (error) {
      setError(null);
    }
  }

  // ==========================================================
  // SUBMIT
  // ==========================================================

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError(null);

    if (!form.zoneId) {
      setError("Seleccioná una zona.");

      return;
    }

    if (!form.staffId) {
      setError("Seleccioná un cobrador.");

      return;
    }

    if (!form.routeDate) {
      setError("Seleccioná la fecha del recorrido.");

      return;
    }

    try {
      await onSubmit({
        zoneId: form.zoneId,

        staffId: form.staffId,

        routeDate: form.routeDate,

        notes: form.notes?.trim() || undefined,
      });
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "No se pudo crear la hoja de ruta.",
      );
    }
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <form
      onSubmit={handleSubmit}
      className="
        space-y-6
        rounded-3xl
        border
        border-white/10
        bg-white/5
        p-6
      "
    >
      {/* HEADER */}

      <div>
        <h2 className="text-2xl font-bold">Nueva hoja de ruta</h2>

        <p className="mt-1 text-sm text-white/50">
          Seleccioná la zona, el cobrador y la fecha. Las cuotas
          correspondientes se agregarán automáticamente según la programación de
          cobranza.
        </p>
      </div>

      {/* INFORMACIÓN */}

      <div
        className="
          rounded-2xl
          border
          border-cyan-400/20
          bg-cyan-400/5
          p-4
        "
      >
        <p className="text-sm leading-6 text-cyan-100/80">
          Ya no necesitás seleccionar las cuotas manualmente. El sistema buscará
          las cuotas pendientes, vencidas o parciales que correspondan al
          cobrador, la zona y la fecha elegida.
        </p>
      </div>

      {/* ZONA + COBRADOR */}

      <div className="grid gap-5 md:grid-cols-2">
        {/* ZONA */}

        <div className="space-y-2">
          <label htmlFor="route-zone" className="text-sm text-white/60">
            Zona
          </label>

          <div
            className="
              flex
              items-center
              gap-3
              rounded-2xl
              border
              border-white/10
              bg-slate-900
              px-4
            "
          >
            <MapPin size={18} className="shrink-0 text-cyan-400" />

            <select
              id="route-zone"
              required
              value={form.zoneId}
              onChange={(event) => update("zoneId", event.target.value)}
              disabled={loading}
              className="
                h-12
                w-full
                cursor-pointer
                bg-slate-900
                text-white
                outline-none
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              <option value="" className="bg-slate-900 text-white">
                Seleccionar zona
              </option>

              {zones.map((zone) => (
                <option
                  key={zone.id}
                  value={zone.id}
                  className="bg-slate-900 text-white"
                >
                  {zone.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* COBRADOR */}

        <div className="space-y-2">
          <label htmlFor="route-collector" className="text-sm text-white/60">
            Cobrador
          </label>

          <div
            className="
              flex
              items-center
              gap-3
              rounded-2xl
              border
              border-white/10
              bg-slate-900
              px-4
            "
          >
            <User size={18} className="shrink-0 text-cyan-400" />

            <select
              id="route-collector"
              required
              value={form.staffId}
              onChange={(event) => update("staffId", event.target.value)}
              disabled={loading}
              className="
                h-12
                w-full
                cursor-pointer
                bg-slate-900
                text-white
                outline-none
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              <option value="" className="bg-slate-900 text-white">
                Seleccionar cobrador
              </option>

              {collectors.map((collector) => (
                <option
                  key={collector.id}
                  value={collector.id}
                  className="bg-slate-900 text-white"
                >
                  {collector.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* FECHA */}

      <div className="space-y-2">
        <label htmlFor="route-date" className="text-sm text-white/60">
          Fecha del recorrido
        </label>

        <div
          className="
            flex
            items-center
            gap-3
            rounded-2xl
            border
            border-white/10
            bg-slate-900
            px-4
          "
        >
          <Calendar size={18} className="shrink-0 text-cyan-400" />

          <input
            id="route-date"
            required
            type="date"
            value={form.routeDate}
            onChange={(event) => update("routeDate", event.target.value)}
            disabled={loading}
            className="
              h-12
              w-full
              bg-slate-900
              text-white
              outline-none
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          />
        </div>
      </div>

      {/* OBSERVACIONES */}

      <div className="space-y-2">
        <label htmlFor="route-notes" className="text-sm text-white/60">
          Observaciones
          <span className="ml-1 text-white/30">(opcional)</span>
        </label>

        <div
          className="
            flex
            items-start
            gap-3
            rounded-2xl
            border
            border-white/10
            bg-slate-900
            px-4
            py-3
          "
        >
          <FileText size={18} className="mt-1 shrink-0 text-cyan-400" />

          <textarea
            id="route-notes"
            value={form.notes ?? ""}
            onChange={(event) => update("notes", event.target.value)}
            disabled={loading}
            rows={3}
            placeholder="Observaciones sobre el recorrido..."
            className="
              min-h-20
              w-full
              resize-none
              bg-transparent
              text-sm
              text-white
              outline-none
              placeholder:text-white/30
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          />
        </div>
      </div>

      {/* ERROR */}

      {error && (
        <div
          className="
            rounded-2xl
            border
            border-red-400/20
            bg-red-400/5
            p-4
            text-sm
            text-red-300
          "
        >
          {error}
        </div>
      )}

      {/* RESUMEN */}

      <div
        className="
          grid
          gap-3
          rounded-2xl
          border
          border-white/10
          bg-black/20
          p-4
          text-sm
          sm:grid-cols-3
        "
      >
        <div>
          <span className="block text-xs text-white/40">Zona</span>

          <span className="mt-1 block font-medium text-white">
            {zones.find((zone) => zone.id === form.zoneId)?.name ??
              "Sin seleccionar"}
          </span>
        </div>

        <div>
          <span className="block text-xs text-white/40">Cobrador</span>

          <span className="mt-1 block font-medium text-white">
            {collectors.find((collector) => collector.id === form.staffId)
              ?.name ?? "Sin seleccionar"}
          </span>
        </div>

        <div>
          <span className="block text-xs text-white/40">Fecha</span>

          <span className="mt-1 block font-medium text-white">
            {form.routeDate || "Sin seleccionar"}
          </span>
        </div>
      </div>

      {/* BOTÓN */}

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
          disabled={loading || !form.zoneId || !form.staffId || !form.routeDate}
          className="
            flex
            items-center
            gap-2
            px-6
            py-3
          "
        >
          {loading && <Loader2 size={18} className="animate-spin" />}

          {loading ? "Creando..." : "Crear hoja de ruta"}
        </SaveButton>
      </div>
    </form>
  );
}
