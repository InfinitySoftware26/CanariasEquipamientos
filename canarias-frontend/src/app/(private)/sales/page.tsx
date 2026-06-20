"use client";

import { useState } from "react";

const filters = [
  { label: "Todas", value: "ALL" },
  { label: "Validación", value: "PENDING_ADMIN_VALIDATION" },
  { label: "Visita", value: "PENDING_ENVIRONMENTAL_VISIT" },
  { label: "Entrega", value: "PENDING_DELIVERY" },
  { label: "Cerradas", value: "CLOSED" },
];

export default function SalesPage() {
  const [selectedFilter, setSelectedFilter] = useState("ALL");

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6">
      {/* HEADER */}
      <section>
        <h1 className="text-2xl font-bold text-white">Ventas</h1>

        <p className="mt-1 text-sm text-slate-400">
          Gestión y seguimiento comercial.
        </p>
      </section>

      {/* KPIS */}
      <section className="overflow-x-auto">
        <div className="flex gap-3 pb-2">
          <div className="min-w-[140px] rounded-2xl border border-white/10 bg-slate-900 p-4">
            <p className="text-xs text-slate-400">Total</p>
            <p className="mt-2 text-2xl font-bold text-white">0</p>
          </div>

          <div className="min-w-[140px] rounded-2xl border border-white/10 bg-slate-900 p-4">
            <p className="text-xs text-slate-400">Pendientes</p>
            <p className="mt-2 text-2xl font-bold text-amber-400">0</p>
          </div>

          <div className="min-w-[140px] rounded-2xl border border-white/10 bg-slate-900 p-4">
            <p className="text-xs text-slate-400">Cerradas</p>
            <p className="mt-2 text-2xl font-bold text-emerald-400">0</p>
          </div>
        </div>
      </section>

      {/* FILTROS */}
      <section className="overflow-x-auto">
        <div className="flex gap-2 pb-2">
          {filters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setSelectedFilter(filter.value)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${
                selectedFilter === filter.value
                  ? "bg-[#F5A300] text-black"
                  : "border border-white/10 bg-slate-900 text-slate-300"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </section>

      {/* LISTADO MOBILE FIRST */}
      <section className="space-y-4">
        {/* Empty State temporal */}
        <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center">
          <p className="text-slate-400">No hay ventas para mostrar.</p>
        </div>

        {/*
        Card ejemplo cuando conectemos API

        <div className="rounded-2xl border border-white/10 bg-slate-900 p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-semibold text-white">
                Juan Pérez
              </p>

              <p className="text-sm text-slate-400">
                20/06/2026
              </p>
            </div>

            <StatusBadge status="PENDING_ADMIN_VALIDATION" />
          </div>

          <div className="mt-4">
            <p className="text-sm text-slate-400">
              Importe
            </p>

            <p className="text-lg font-semibold text-white">
              $150.000
            </p>
          </div>
        </div>
        */}
      </section>
    </div>
  );
}
