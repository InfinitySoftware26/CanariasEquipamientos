"use client";

import { useState } from "react";

import { useLoanSimulator } from "@/hooks/financing/useLoanSimulator";

interface LoanSimulatorProps {
  rates: {
    rate3: number;
    rate6: number;
    rate9: number;
  };
}

const INSTALLMENT_OPTIONS: { value: 3 | 6 | 9; label: string }[] = [
  { value: 3, label: "3 cuotas" },
  { value: 6, label: "6 cuotas" },
  { value: 9, label: "9 cuotas" },
];

export function LoanSimulator({ rates }: LoanSimulatorProps) {
  const [price, setPrice] = useState("");
  const [installments, setInstallments] = useState<3 | 6 | 9>(3);

  const rateByInstallments: Record<3 | 6 | 9, number> = {
    3: rates.rate3,
    6: rates.rate6,
    9: rates.rate9,
  };

  const rate = rateByInstallments[installments];

  const { totalFinanced, installmentValue } = useLoanSimulator({
    price: Number(price),
    installments,
    rate,
  });

  const hasResult = Number(price) > 0;

  return (
    <div className="space-y-6 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl sm:p-8">
      <div>
        <h2 className="text-xl font-bold text-white">Simulador de cuotas</h2>

        <p className="mt-1 text-sm text-white/60">
          Calculá el valor de cuota según el precio y la cantidad elegida.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm text-white/70">
            Precio del producto
          </label>

          <input
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0,00"
            className="w-full rounded-xl bg-slate-900 p-3 text-white outline-none ring-1 ring-white/10 focus:ring-[#F5A300]"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm text-white/70">Cuotas</label>

          <div className="flex gap-2">
            {INSTALLMENT_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setInstallments(option.value)}
                className={`flex-1 rounded-xl px-4 py-3 text-sm font-medium transition ${
                  installments === option.value
                    ? "bg-[#F5A300] text-black"
                    : "bg-slate-900 text-white hover:bg-slate-800"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <ResultCard
          label="Tasa aplicada"
          value={`${(rate * 100).toFixed(2)}%`}
        />

        <ResultCard
          label="Valor de cuota"
          value={
            hasResult
              ? `$ ${installmentValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
              : "—"
          }
        />

        <ResultCard
          label="Total financiado"
          value={
            hasResult
              ? `$ ${totalFinanced.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
              : "—"
          }
        />
      </div>
    </div>
  );
}

function ResultCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0E1726] p-5">
      <p className="text-sm text-white/50">{label}</p>

      <p className="mt-2 text-2xl font-bold text-[#ffa408]">{value}</p>
    </div>
  );
}
