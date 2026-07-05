"use client";

import { Package } from "lucide-react";
import { StepTitle } from "./StepTitle";
import { StepSaleProps } from "@/types/preload-sale/preload.type";
import { useState } from "react";

type Option<T> = {
  label: string;
  value: T;
};

export function StepSale({
  form,
  setForm,
  products,
  handleSubmit,
  loading,
}: StepSaleProps) {
  const [openProduct, setOpenProduct] = useState(false);
  const [openInstallments, setOpenInstallments] = useState(false);
  const [openFrequency, setOpenFrequency] = useState(false);

  const selectedProduct = products.find(
    (p) => p.productId === form.productId,
  );

  // ---------------- CUOTAS ----------------

  const installmentOptions: Option<number>[] = [
    { label: "3 cuotas", value: 3 },
    { label: "6 cuotas", value: 6 },
    { label: "9 cuotas", value: 9 },
  ];

  const selectedInstallment = installmentOptions.find(
    (o) => o.value === form.installmentsCount,
  );

  // ---------------- FRECUENCIA ----------------

  const frequencyOptions: Option<"weekly" | "monthly">[] = [
    { label: "Mensual", value: "monthly" },
    { label: "Semanal", value: "weekly" },
  ];

  const selectedFrequency = frequencyOptions.find(
    (o) => o.value === form.paymentFrequency,
  );

  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
      <StepTitle icon={<Package size={18} />} label="Venta" />

      <div className="space-y-3">

        {/* ---------------- CLIENTE ---------------- */}
        <div className="rounded-2xl border border-[#F5A300]/20 bg-[#F5A300]/5 p-4">
          <p className="mb-1 text-xs uppercase tracking-wider text-[#F5A300]/80">
            Cliente seleccionado
          </p>

          <div className="flex flex-col">
            <span className="text-base font-semibold text-white">
              {form.name} {form.surname}
            </span>

            <span className="text-sm text-white/60">
              DNI {form.documentNumber}
            </span>
          </div>
        </div>

        {/* ---------------- PRODUCTO ---------------- */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpenProduct(!openProduct)}
            className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-left text-white transition hover:border-[#F5A300]/60 focus:border-[#F5A300] focus:outline-none"
          >
            {selectedProduct?.name ?? "Seleccionar producto"}
          </button>

          {openProduct && (
            <div className="absolute z-10 mt-2 max-h-52 w-full overflow-auto rounded-xl border border-white/10 bg-[#0D1B2A]">
              {products.map((p) => (
                <div
                  key={p.productId}
                  onClick={() => {
                    setForm({
                      ...form,
                      productId: p.productId,
                    });

                    setOpenProduct(false);
                  }}
                  className="cursor-pointer px-3 py-2 hover:bg-white/10"
                >
                  {p.name}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ---------------- CUOTAS ---------------- */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpenInstallments(!openInstallments)}
            className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-left text-white transition hover:border-[#F5A300]/60 focus:border-[#F5A300] focus:outline-none"
          >
            {selectedInstallment?.label ?? "Cantidad de cuotas"}
          </button>

          {openInstallments && (
            <div className="absolute z-10 mt-2 w-full overflow-hidden rounded-xl border border-white/10 bg-[#0D1B2A]">
              {installmentOptions.map((opt) => (
                <div
                  key={opt.value}
                  onClick={() => {
                    setForm({
                      ...form,
                      installmentsCount: opt.value,
                    });

                    setOpenInstallments(false);
                  }}
                  className="cursor-pointer px-3 py-2 hover:bg-white/10"
                >
                  {opt.label}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ---------------- FRECUENCIA ---------------- */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpenFrequency(!openFrequency)}
            className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-left text-white transition hover:border-[#F5A300]/60 focus:border-[#F5A300] focus:outline-none"
          >
            {selectedFrequency?.label ?? "Frecuencia de pago"}
          </button>

          {openFrequency && (
            <div className="absolute z-10 mt-2 w-full overflow-hidden rounded-xl border border-white/10 bg-[#0D1B2A]">
              {frequencyOptions.map((opt) => (
                <div
                  key={opt.value}
                  onClick={() => {
                    setForm({
                      ...form,
                      paymentFrequency: opt.value,
                    });

                    setOpenFrequency(false);
                  }}
                  className="cursor-pointer px-3 py-2 hover:bg-white/10"
                >
                  {opt.label}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ---------------- CANTIDAD ---------------- */}
        <input
          type="number"
          className="input"
          value={form.quantity}
          onChange={(e) =>
            setForm({
              ...form,
              quantity: Number(e.target.value),
            })
          }
        />

        {/* ---------------- FECHA ---------------- */}
        <input
          type="date"
          className="input"
          value={form.firstDueDate}
          onChange={(e) =>
            setForm({
              ...form,
              firstDueDate: e.target.value,
            })
          }
        />

        {/* ---------------- SUBMIT ---------------- */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full rounded-xl bg-[#F5A300] py-2 font-semibold text-[#0D1B2A]"
        >
          {loading ? "Enviando..." : "Confirmar venta"}
        </button>
      </div>
    </section>
  );
}