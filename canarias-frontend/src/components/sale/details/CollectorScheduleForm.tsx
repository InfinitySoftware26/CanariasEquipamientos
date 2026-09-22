"use client";

import { useEffect, useMemo, useState } from "react";

import { Sale } from "@/types/sales/sale.type";

import { SaveButton } from "@/components/button/SaveButton";
import { configureCollectionSchedule } from "@/services/collectors/collectors.services";

interface Props {
  sale: Sale;

  onRefresh: () => void | Promise<void>;
}

type ScheduleType = "fixed_weekday" | "monthly_range";

const WEEKDAYS = [
  {
    value: 1,
    label: "Lunes",
  },
  {
    value: 2,
    label: "Martes",
  },
  {
    value: 3,
    label: "Miércoles",
  },
  {
    value: 4,
    label: "Jueves",
  },
  {
    value: 5,
    label: "Viernes",
  },
  {
    value: 6,
    label: "Sábado",
  },
  {
    value: 0,
    label: "Domingo",
  },
];

function getToday() {
  const now = new Date();

  const year = now.getFullYear();

  const month = String(now.getMonth() + 1).padStart(2, "0");

  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatCalendarDate(value?: string | null) {
  if (!value) {
    return "-";
  }

  const datePart = value.split("T")[0];

  const [year, month, day] = datePart.split("-").map(Number);

  if (!year || !month || !day) {
    return "-";
  }

  return new Date(year, month - 1, day).toLocaleDateString("es-AR", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function CollectionScheduleForm({ sale, onRefresh }: Props) {
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [success, setSuccess] = useState(false);

  const [scheduleType, setScheduleType] = useState<ScheduleType>(
    sale.collectionScheduleType ?? "fixed_weekday",
  );

  const [collectionWeekday, setCollectionWeekday] = useState<number>(
    sale.collectionWeekday ?? 1,
  );

  const [rangeStart, setRangeStart] = useState<string>(
    sale.paymentRangeStartDay != null ? String(sale.paymentRangeStartDay) : "1",
  );

  const [rangeEnd, setRangeEnd] = useState<string>(
    sale.paymentRangeEndDay != null ? String(sale.paymentRangeEndDay) : "10",
  );

  const [manualCollectionDate, setManualCollectionDate] = useState(
    sale.manualCollectionDate?.slice(0, 10) ?? "",
  );

  const [secondDueDate, setSecondDueDate] = useState(
    sale.secondDueDate?.slice(0, 10) ?? "",
  );

  const [lateInterestPercent, setLateInterestPercent] = useState(
    sale.dailyLateInterestRate != null && Number(sale.dailyLateInterestRate) > 0
      ? String(Number(sale.dailyLateInterestRate) * 100)
      : "",
  );

  useEffect(() => {
    if (sale.collectionScheduleType) {
      setScheduleType(sale.collectionScheduleType);
    }

    if (sale.collectionWeekday != null) {
      setCollectionWeekday(sale.collectionWeekday);
    }

    if (sale.paymentRangeStartDay != null) {
      setRangeStart(String(sale.paymentRangeStartDay));
    }

    if (sale.paymentRangeEndDay != null) {
      setRangeEnd(String(sale.paymentRangeEndDay));
    }

    setManualCollectionDate(sale.manualCollectionDate?.slice(0, 10) ?? "");

    setSecondDueDate(sale.secondDueDate?.slice(0, 10) ?? "");

    if (
      sale.dailyLateInterestRate != null &&
      Number(sale.dailyLateInterestRate) > 0
    ) {
      setLateInterestPercent(String(Number(sale.dailyLateInterestRate) * 100));
    } else {
      setLateInterestPercent("");
    }
  }, [
    sale.collectionScheduleType,
    sale.collectionWeekday,
    sale.paymentRangeStartDay,
    sale.paymentRangeEndDay,
    sale.manualCollectionDate,
    sale.secondDueDate,
    sale.dailyLateInterestRate,
  ]);

  const hasSchedule = Boolean(sale.collectionScheduleType);

  const currentScheduleLabel = useMemo(() => {
    if (sale.collectionScheduleType === "fixed_weekday") {
      const weekday = WEEKDAYS.find(
        (day) => day.value === sale.collectionWeekday,
      );

      return weekday ? weekday.label : "Día no configurado";
    }

    if (sale.collectionScheduleType === "monthly_range") {
      return `Entre los días ${sale.paymentRangeStartDay ?? "-"} y ${
        sale.paymentRangeEndDay ?? "-"
      }`;
    }

    return null;
  }, [
    sale.collectionScheduleType,
    sale.collectionWeekday,
    sale.paymentRangeStartDay,
    sale.paymentRangeEndDay,
  ]);

  function validateForm(): string | null {
    if (sale.status !== "closed") {
      return "La venta debe estar cerrada antes de configurar la cobranza.";
    }

    if (!sale.assignedCollectorId) {
      return "La venta debe tener un cobrador asignado.";
    }

    if (lateInterestPercent.trim()) {
      const lateInterest = Number(lateInterestPercent);

      if (
        Number.isNaN(lateInterest) ||
        lateInterest < 0 ||
        lateInterest > 100
      ) {
        return "El interés diario debe estar entre 0 y 100%.";
      }
    }

    if (scheduleType === "fixed_weekday") {
      if (collectionWeekday < 0 || collectionWeekday > 6) {
        return "Seleccioná un día válido.";
      }
    }

    if (scheduleType === "monthly_range") {
      const start = Number(rangeStart);

      const end = Number(rangeEnd);

      if (!Number.isInteger(start) || !Number.isInteger(end)) {
        return "Ingresá días válidos para el rango.";
      }

      if (start < 1 || start > 31 || end < 1 || end > 31) {
        return "Los días del rango deben estar entre 1 y 31.";
      }

      if (start > end) {
        return "El inicio del rango no puede ser posterior al final.";
      }

      if (!manualCollectionDate) {
        return "Seleccioná el día concreto coordinado con el cliente.";
      }

      const [year, month, day] = manualCollectionDate.split("-").map(Number);

      const date = new Date(year, month - 1, day);

      const dayOfMonth = date.getDate();

      if (dayOfMonth < start || dayOfMonth > end) {
        return "La fecha coordinada debe estar dentro del rango seleccionado.";
      }
    }

    return null;
  }

  async function handleSubmit() {
    setError(null);

    setSuccess(false);

    const validation = validateForm();

    if (validation) {
      setError(validation);

      return;
    }

    try {
      setLoading(true);

      const hasLateInterestOverride = Boolean(lateInterestPercent.trim());

      const dailyRate = hasLateInterestOverride
        ? Number(lateInterestPercent) / 100
        : undefined;

      await configureCollectionSchedule(sale.saleId, {
        collectionScheduleType: scheduleType,

        ...(scheduleType === "fixed_weekday"
          ? {
              collectionWeekday,
            }
          : {
              paymentRangeStartDay: Number(rangeStart),

              paymentRangeEndDay: Number(rangeEnd),

              manualCollectionDate,
            }),

        ...(secondDueDate
          ? {
              secondDueDate,
            }
          : {}),

        ...(dailyRate !== undefined
          ? {
              dailyLateInterestRate: dailyRate,
            }
          : {}),
      });

      setSuccess(true);

      await onRefresh();
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "No se pudo configurar la cobranza.",
      );
    } finally {
      setLoading(false);
    }
  }

  if (sale.status !== "closed") {
    return null;
  }

  return (
    <div className="space-y-5 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-5">
      <div>
        <h3 className="font-semibold text-cyan-300">
          Configuración de cobranza
        </h3>

        <p className="mt-2 text-sm text-white/60">
          Coordiná con el cliente el día habitual en el que el cobrador debe
          visitarlo.
        </p>
      </div>

      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
        <p className="font-semibold text-emerald-300">
          Automatización desde cuota 2
        </p>

        <p className="mt-2 text-sm text-white/70">
          La primera cuota ya fue cobrada durante la entrega. Las hojas de ruta
          automáticas comenzarán desde la segunda cuota.
        </p>
      </div>

      {hasSchedule && (
        <div className="rounded-xl border border-white/10 bg-black/10 p-4">
          <p className="text-xs text-white/40">Configuración actual</p>

          <p className="mt-1 font-semibold text-white">
            {currentScheduleLabel}
          </p>

          {sale.secondDueDate && (
            <p className="mt-2 text-sm text-white/60">
              Segunda cuota: {formatCalendarDate(sale.secondDueDate)}
            </p>
          )}
        </div>
      )}

      <div>
        <label className="mb-2 block text-sm text-white/70">
          Modalidad de cobranza
        </label>

        <select
          value={scheduleType}
          disabled={loading}
          onChange={(event) => {
            setScheduleType(event.target.value as ScheduleType);

            setError(null);
          }}
          className="w-full rounded-xl bg-[#0B1220] p-3 text-white outline-none ring-1 ring-white/10 focus:ring-cyan-500"
        >
          <option value="fixed_weekday" className="bg-[#0B1220]">
            Día fijo semanal
          </option>

          <option value="monthly_range" className="bg-[#0B1220]">
            Rango mensual
          </option>
        </select>
      </div>

      {scheduleType === "fixed_weekday" && (
        <div>
          <label className="mb-2 block text-sm text-white/70">
            Día habitual de cobranza
          </label>

          <select
            value={collectionWeekday}
            disabled={loading}
            onChange={(event) =>
              setCollectionWeekday(Number(event.target.value))
            }
            className="w-full rounded-xl bg-[#0B1220] p-3 text-white outline-none ring-1 ring-white/10 focus:ring-cyan-500"
          >
            {WEEKDAYS.map((weekday) => (
              <option
                key={weekday.value}
                value={weekday.value}
                className="bg-[#0B1220]"
              >
                {weekday.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {scheduleType === "monthly_range" && (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm text-white/70">
                Desde el día
              </label>

              <input
                type="number"
                min="1"
                max="31"
                value={rangeStart}
                disabled={loading}
                onChange={(event) => setRangeStart(event.target.value)}
                className="w-full rounded-xl bg-[#0B1220] p-3 text-white outline-none ring-1 ring-white/10"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-white/70">
                Hasta el día
              </label>

              <input
                type="number"
                min="1"
                max="31"
                value={rangeEnd}
                disabled={loading}
                onChange={(event) => setRangeEnd(event.target.value)}
                className="w-full rounded-xl bg-[#0B1220] p-3 text-white outline-none ring-1 ring-white/10"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm text-white/70">
              Fecha concreta acordada
            </label>

            <input
              type="date"
              min={getToday()}
              value={manualCollectionDate}
              disabled={loading}
              onChange={(event) => setManualCollectionDate(event.target.value)}
              className="w-full rounded-xl bg-[#0B1220] p-3 text-white outline-none ring-1 ring-white/10"
            />
          </div>
        </div>
      )}

      <div>
        <label className="mb-2 block text-sm text-white/70">
          Fecha de segunda cuota
        </label>

        <input
          type="date"
          min={getToday()}
          value={secondDueDate}
          disabled={loading}
          onChange={(event) => setSecondDueDate(event.target.value)}
          className="w-full rounded-xl bg-[#0B1220] p-3 text-white outline-none ring-1 ring-white/10"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm text-white/70">
          Interés diario por mora (%)
        </label>

        <input
          type="number"
          min="0"
          max="100"
          step="0.01"
          value={lateInterestPercent}
          disabled={loading}
          onChange={(event) => setLateInterestPercent(event.target.value)}
          placeholder="Usar tasa configurada en la sucursal"
          className="w-full rounded-xl bg-[#0B1220] p-3 text-white outline-none ring-1 ring-white/10"
        />

        <p className="mt-2 text-xs text-white/40">
          Dejalo vacío para usar automáticamente la tasa de mora configurada en
          la sucursal. Completalo sólo si esta venta necesita una tasa
          diferente.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-300">
          Configuración de cobranza guardada correctamente.
        </div>
      )}

      <SaveButton disabled={loading} onClick={handleSubmit} className="w-full">
        {loading
          ? "Guardando..."
          : hasSchedule
            ? "Actualizar programación"
            : "Habilitar cobranza automática"}
      </SaveButton>
    </div>
  );
}
