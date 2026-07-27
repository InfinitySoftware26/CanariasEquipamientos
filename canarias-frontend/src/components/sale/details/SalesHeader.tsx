"use client";

import { Sale } from "@/types/sales/sale.type";

import { getSaleStatusLabel } from "@/lib/sales/getSalesStatusLabel";
import { getDisplayCode } from "@/lib/sales/displayCode";

import { SaleStatusBadge } from "../SalesStatusBadge";

interface SaleHeaderProps {
  sale: Sale;
}

export function SaleHeader({ sale }: SaleHeaderProps) {
  const badge = getSaleStatusLabel(sale.status);

  return (
    <section className="rounded-3xl border border-white/10 bg-[#111827] shadow-xl">
      <div className="flex flex-col gap-8 p-8 lg:flex-row lg:justify-between">
        <div className="space-y-6">
          <div>
            <p className="text-sm uppercase tracking-widest text-white/40">
              Venta
            </p>

            <h1 className="mt-2 text-3xl font-bold text-white">
              {getDisplayCode("VTA", sale.saleId)}
            </h1>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-white">
              {sale.client?.name} {sale.client?.surname}
            </h2>

            <p className="text-sm text-white/50">Cliente</p>

            <p className="font-medium text-white">
              {getDisplayCode("CLI", sale.clientId)}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-start gap-5 lg:items-end">
          <SaleStatusBadge {...badge} />

          <div className="text-right">
            <p className="text-sm text-white/50">Fecha de venta</p>

            <p className="font-medium text-white">
              {new Date(sale.saleDate).toLocaleDateString("es-AR")}
            </p>
          </div>

          <div className="text-right">
            <p className="text-sm text-white/50">Primer vencimiento</p>

            <p className="font-medium text-white">
              {new Date(sale.firstDueDate).toLocaleDateString("es-AR")}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-5 border-t border-white/10 p-8 md:grid-cols-4">
        <div>
          <p className="text-sm text-white/40">Total</p>

          <p className="mt-1 text-xl font-bold text-[#F5A300]">
            ${sale.totalAmount.toLocaleString()}
          </p>
        </div>

        <div>
          <p className="text-sm text-white/40">Cuotas</p>

          <p className="mt-1 text-xl font-semibold text-white">
            {sale.installmentsCount}
          </p>
        </div>

        <div>
          <p className="text-sm text-white/40">Valor cuota</p>

          <p className="mt-1 text-xl font-semibold text-white">
            ${sale.installmentAmount.toLocaleString()}
          </p>
        </div>

        <div>
          <p className="text-sm text-white/40">Frecuencia</p>

          <p className="mt-1 text-xl font-semibold capitalize text-white">
            {sale.paymentFrequency}
          </p>
        </div>
      </div>
    </section>
  );
}
