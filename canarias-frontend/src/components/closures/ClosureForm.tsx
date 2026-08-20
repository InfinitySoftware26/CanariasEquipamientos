"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { useCreateClosure } from "@/hooks/closures/useCreateClosure";
import { CreateClosurePayload } from "@/types/closures/closure.types";

function getToday() {
  return new Date().toISOString().split("T")[0];
}

export function ClosureForm() {
  const router = useRouter();
  const { create, loading } = useCreateClosure();

  const [closingDate, setClosingDate] = useState(getToday());
  const [totalCollected, setTotalCollected] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");

    const amount = Number(totalCollected);

    if (!closingDate) {
      setError("Seleccioná la fecha del cierre.");
      return;
    }

    if (!Number.isFinite(amount) || amount < 0) {
      setError("El total declarado debe ser un número válido.");
      return;
    }

    const payload: CreateClosurePayload = {
      closingDate,
      totalCollected: amount,
    };

    if (notes.trim()) payload.notes = notes.trim();

    try {
      await create(payload);

      router.push("/closures");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo declarar el cierre",
      );
    }
  }

  return (
    <form
      onSubmit={submit}
      className="space-y-6 rounded-3xl border border-white/10 bg-[#0E1726] p-6 sm:p-8"
    >
      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label
            htmlFor="closingDate"
            className="mb-2 block text-sm font-medium text-white"
          >
            Fecha del cierre
          </label>

          <input
            id="closingDate"
            type="date"
            required
            max={getToday()}
            value={closingDate}
            onChange={(e) => setClosingDate(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-[#F5A300]"
          />
        </div>

        <div>
          <label
            htmlFor="totalCollected"
            className="mb-2 block text-sm font-medium text-white"
          >
            Total cobrado en el día
          </label>

          <input
            id="totalCollected"
            type="number"
            min="0"
            step="0.01"
            required
            placeholder="0.00"
            value={totalCollected}
            onChange={(e) => setTotalCollected(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-[#F5A300]"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="notes"
          className="mb-2 block text-sm font-medium text-white"
        >
          Observaciones (opcional)
        </label>

        <textarea
          id="notes"
          rows={3}
          placeholder="Diferencias, novedades del recorrido, etc."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full resize-none rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-[#F5A300]"
        />
      </div>

      <p className="text-xs text-white/40">
        El total declarado se compara contra lo calculado por el sistema al
        momento de la validación administrativa (conciliación).
      </p>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.push("/closures")}
          disabled={loading}
          className="rounded-xl border border-white/10 px-5 py-3 font-medium text-white transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancelar
        </button>

        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-[#F5A300] px-5 py-3 font-semibold text-black transition hover:bg-[#ffb21c] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Declarando..." : "Declarar cierre"}
        </button>
      </div>
    </form>
  );
}
