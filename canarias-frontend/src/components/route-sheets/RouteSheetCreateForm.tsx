"use client";

import { useEffect, useState } from "react";

import { Loader2, Calendar, MapPin, User } from "lucide-react";

import { SaveButton } from "@/components/button/SaveButton";

import { CreateRouteSheetPayload } from "@/types/rotue-sheets/createRouteSheets.type";

import { getAvailableInstallments } from "@/services/route-sheets/routeSheets.service";

import { AvailableRouteInstallment } from "@/types/rotue-sheets/available-installment.type";

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
    installmentIds: [],
  });

  const [availableInstallments, setAvailableInstallments] = useState<
    AvailableRouteInstallment[]
  >([]);

  const [loadingInstallments, setLoadingInstallments] = useState(false);

  const [installmentsError, setInstallmentsError] = useState<string | null>(
    null,
  );

  const [createError, setCreateError] = useState<string | null>(null);

  // ==========================================================
  // UPDATE FORM
  // ==========================================================

  function update<K extends keyof CreateRouteSheetPayload>(
    key: K,
    value: CreateRouteSheetPayload[K],
  ) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));

    // Si cambia algún dato principal,
    // limpiamos el error anterior de creación.
    setCreateError(null);
  }

  // ==========================================================
  // CARGAR CUOTAS
  // ==========================================================

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      installmentIds: [],
    }));

    setAvailableInstallments([]);
    setInstallmentsError(null);
    setCreateError(null);

    if (!form.zoneId || !form.staffId || !form.routeDate) {
      return;
    }

    async function loadInstallments() {
      try {
        setLoadingInstallments(true);
        setInstallmentsError(null);

        console.log("==========================================");
        console.log("📌 CONSULTANDO CUOTAS DISPONIBLES");
        console.log("==========================================");
        console.log("ZONE ID:", form.zoneId);
        console.log("STAFF ID:", form.staffId);
        console.log("ROUTE DATE:", form.routeDate);

        const data = await getAvailableInstallments(
          form.zoneId,
          form.staffId,
          form.routeDate,
        );

        console.log(
          "📌 AVAILABLE INSTALLMENTS RESPONSE:",
          JSON.stringify(data, null, 2),
        );

        setAvailableInstallments(data);

        if (data.length === 0) {
          setInstallmentsError(
            "No hay cuotas disponibles para cobrar en esta zona y fecha.",
          );
        }
      } catch (error) {
        console.error("❌ Error obteniendo cuotas disponibles:", error);

        setAvailableInstallments([]);

        setInstallmentsError(
          error instanceof Error
            ? error.message
            : "No se pudieron obtener las cuotas disponibles",
        );
      } finally {
        setLoadingInstallments(false);
      }
    }

    loadInstallments();
  }, [form.zoneId, form.staffId, form.routeDate]);

  // ==========================================================
  // SELECCIONAR CUOTA
  // ==========================================================

  function toggleInstallment(installmentId: string) {
    setCreateError(null);

    setForm((prev) => {
      const current = prev.installmentIds ?? [];

      const alreadySelected = current.includes(installmentId);

      return {
        ...prev,
        installmentIds: alreadySelected
          ? current.filter((id) => id !== installmentId)
          : [...current, installmentId],
      };
    });
  }

  // ==========================================================
  // SELECCIONAR TODAS
  // ==========================================================

  function selectAllInstallments() {
    setCreateError(null);

    setForm((prev) => ({
      ...prev,
      installmentIds: availableInstallments.map(
        (installment) => installment.installmentId,
      ),
    }));
  }

  // ==========================================================
  // LIMPIAR
  // ==========================================================

  function clearInstallments() {
    setCreateError(null);

    setForm((prev) => ({
      ...prev,
      installmentIds: [],
    }));
  }

  // ==========================================================
  // SUBMIT
  // ==========================================================

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setCreateError(null);

    if (!form.zoneId || !form.staffId || !form.routeDate) {
      return;
    }

    if (!form.installmentIds || form.installmentIds.length === 0) {
      setInstallmentsError(
        "Debés seleccionar al menos una cuota para crear la hoja de ruta.",
      );

      return;
    }

    const payload: CreateRouteSheetPayload = {
      zoneId: form.zoneId,
      staffId: form.staffId,
      routeDate: form.routeDate,
      installmentIds: [...form.installmentIds],
    };

    console.log("==========================================");
    console.log("🚀 SUBMIT CREAR HOJA DE RUTA");
    console.log("==========================================");
    console.log("PAYLOAD:", payload);
    console.log("ZONE ID:", payload.zoneId);
    console.log("STAFF ID:", payload.staffId);
    console.log("ROUTE DATE:", payload.routeDate);
    console.log("INSTALLMENT IDS:", payload.installmentIds);
    console.log("INSTALLMENT COUNT:", payload.installmentIds.length);
    console.log("==========================================");

    try {
      await onSubmit(payload);

      console.log("✅ onSubmit finalizado correctamente");
    } catch (error) {
      console.error("❌ Error en onSubmit:", error);

      const message =
        error instanceof Error
          ? error.message
          : "No se pudo crear la hoja de ruta.";

      setCreateError(message);
    }
  }

  const hasSelectedInstallments = (form.installmentIds?.length ?? 0) > 0;

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
          Seleccioná la zona, el cobrador, la fecha y las cuotas que se deberán
          cobrar.
        </p>
      </div>

      {/* ERROR CREACIÓN */}

      {createError && (
        <div
          className="
            rounded-2xl
            border
            border-red-400/20
            bg-red-400/5
            p-5
            text-sm
            text-red-300
          "
        >
          <p className="font-semibold">No se pudo crear la hoja de ruta</p>

          <p className="mt-1">{createError}</p>
        </div>
      )}

      {/* ZONA + COBRADOR */}

      <div className="grid gap-5 md:grid-cols-2">
        {/* ZONA */}

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
              bg-slate-900
              px-4
            "
          >
            <MapPin size={18} className="shrink-0 text-cyan-400" />

            <select
              required
              value={form.zoneId}
              onChange={(e) => update("zoneId", e.target.value)}
              className="
                h-12
                w-full
                cursor-pointer
                bg-slate-900
                text-white
                outline-none
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
          <label className="text-sm text-white/60">Cobrador</label>

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
              required
              value={form.staffId}
              onChange={(e) => update("staffId", e.target.value)}
              className="
                h-12
                w-full
                cursor-pointer
                bg-slate-900
                text-white
                outline-none
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
        <label className="text-sm text-white/60">Fecha del recorrido</label>

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
            required
            type="date"
            value={form.routeDate}
            onChange={(e) => update("routeDate", e.target.value)}
            className="
              h-12
              w-full
              bg-slate-900
              text-white
              outline-none
            "
          />
        </div>
      </div>

      {/* CUOTAS */}

      <div className="space-y-4">
        <div
          className="
            flex
            flex-col
            gap-3
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          <div>
            <h3 className="text-lg font-semibold">Cuotas pendientes</h3>

            <p className="text-sm text-white/50">
              Seleccioná las cuotas que el cobrador deberá gestionar en este
              recorrido.
            </p>
          </div>

          {availableInstallments.length > 0 && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={selectAllInstallments}
                className="
                  rounded-xl
                  border
                  border-white/10
                  bg-white/5
                  px-3
                  py-2
                  text-xs
                  font-medium
                  text-white
                  transition
                  hover:bg-white/10
                "
              >
                Seleccionar todas
              </button>

              <button
                type="button"
                onClick={clearInstallments}
                className="
                  rounded-xl
                  border
                  border-white/10
                  bg-white/5
                  px-3
                  py-2
                  text-xs
                  font-medium
                  text-white/60
                  transition
                  hover:bg-white/10
                  hover:text-white
                "
              >
                Limpiar
              </button>
            </div>
          )}
        </div>

        {/* SIN PARÁMETROS */}

        {!form.zoneId || !form.staffId || !form.routeDate ? (
          <div
            className="
              rounded-2xl
              border
              border-dashed
              border-white/10
              bg-black/20
              p-6
              text-center
              text-sm
              text-white/40
            "
          >
            Seleccioná zona, cobrador y fecha para consultar las cuotas
            pendientes.
          </div>
        ) : loadingInstallments ? (
          <div
            className="
              flex
              items-center
              justify-center
              gap-3
              rounded-2xl
              border
              border-white/10
              bg-black/20
              p-8
              text-sm
              text-white/50
            "
          >
            <Loader2 size={20} className="animate-spin text-cyan-400" />
            Buscando cuotas pendientes...
          </div>
        ) : installmentsError && availableInstallments.length === 0 ? (
          <div
            className="
              rounded-2xl
              border
              border-red-400/20
              bg-red-400/5
              p-5
              text-sm
              text-red-300
            "
          >
            {installmentsError}
          </div>
        ) : availableInstallments.length === 0 ? (
          <div
            className="
              rounded-2xl
              border
              border-white/10
              bg-black/20
              p-6
              text-center
              text-sm
              text-white/40
            "
          >
            No hay cuotas pendientes disponibles para este cobrador, zona y
            fecha.
          </div>
        ) : (
          <div className="space-y-3">
            {availableInstallments.map((installment) => {
              const selected =
                form.installmentIds?.includes(installment.installmentId) ??
                false;

              return (
                <label
                  key={installment.installmentId}
                  className={`
                      flex
                      cursor-pointer
                      items-start
                      gap-4
                      rounded-2xl
                      border
                      p-4
                      transition
                      ${
                        selected
                          ? "border-cyan-400/40 bg-cyan-400/10"
                          : "border-white/10 bg-black/20 hover:bg-white/5"
                      }
                    `}
                >
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() =>
                      toggleInstallment(installment.installmentId)
                    }
                    className="
                        mt-1
                        h-4
                        w-4
                        shrink-0
                        cursor-pointer
                        accent-cyan-400
                      "
                  />

                  <div className="min-w-0 flex-1">
                    <div
                      className="
                          flex
                          flex-col
                          gap-1
                          sm:flex-row
                          sm:items-center
                          sm:justify-between
                        "
                    >
                      <p className="font-medium text-white">
                        {installment.clientName}
                      </p>

                      <span className="font-semibold text-cyan-400">
                        ${Number(installment.amount).toLocaleString("es-AR")}
                      </span>
                    </div>

                    <div
                      className="
                          mt-2
                          grid
                          gap-1
                          text-xs
                          text-white/50
                          sm:grid-cols-3
                        "
                    >
                      <span>Cuota {installment.installmentNumber}</span>

                      <span>Vencimiento: {installment.dueDate}</span>

                      {installment.clientAddress && (
                        <span className="truncate">
                          {installment.clientAddress}
                        </span>
                      )}
                    </div>
                  </div>
                </label>
              );
            })}

            {/* RESUMEN */}

            <div
              className="
                flex
                flex-col
                gap-2
                rounded-2xl
                border
                border-white/10
                bg-black/20
                p-4
                sm:flex-row
                sm:items-center
                sm:justify-between
              "
            >
              <span className="text-sm text-white/50">
                Cuotas seleccionadas
              </span>

              <span className="font-semibold text-white">
                {form.installmentIds?.length ?? 0} de{" "}
                {availableInstallments.length}
              </span>
            </div>

            {!hasSelectedInstallments && (
              <p className="text-sm text-amber-300">
                Debés seleccionar al menos una cuota para crear la hoja de ruta.
              </p>
            )}
          </div>
        )}
      </div>

      {/* ERROR CREACIÓN */}

      {createError && (
        <div
          className="
            rounded-2xl
            border
            border-red-400/20
            bg-red-400/5
            p-5
            text-sm
            text-red-300
          "
        >
          <p className="font-semibold">No se pudo crear la hoja de ruta</p>

          <p className="mt-1">{createError}</p>
        </div>
      )}

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
          disabled={
            loading ||
            loadingInstallments ||
            !form.zoneId ||
            !form.staffId ||
            !form.routeDate ||
            !hasSelectedInstallments
          }
          className="
            flex
            items-center
            gap-2
            px-6
            py-3
          "
        >
          {loading && <Loader2 size={18} className="animate-spin" />}
          Crear hoja de ruta
        </SaveButton>
      </div>
    </form>
  );
}
