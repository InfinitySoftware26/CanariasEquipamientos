"use client";

import { Sale } from "@/types/sales/sale.type";
import { SaleRow } from "./SaleRow";
import { getDisplayCode } from "@/lib/sales/displayCode";

interface Props {
  sales: Sale[];
}

export function SalesTable({ sales }: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0E1726] md:rounded-3xl">
      <div className="overflow-x-auto">
        <table className="min-w-[760px] w-full">
          <thead className="border-b border-white/10 bg-white/5">
            <tr className="text-left text-[10px] uppercase tracking-wider text-white/50 md:text-xs">
              <th className="px-3 py-3 md:px-6 md:py-4">Venta</th>
              <th className="px-3 py-3 md:px-6 md:py-4">Cliente</th>
              <th className="px-3 py-3 md:px-6 md:py-4">Producto</th>
              <th className="px-3 py-3 md:px-6 md:py-4">Fecha</th>
              <th className="px-3 py-3 text-center md:px-6 md:py-4">Cuotas</th>
              <th className="px-3 py-3 md:px-6 md:py-4">Monto</th>
              <th className="px-3 py-3 md:px-6 md:py-4">Estado</th>
              <th className="px-3 py-3 md:px-6 md:py-4"></th>
            </tr>
          </thead>

          <tbody>
            {sales.map((sale) => (
              <SaleRow key={getDisplayCode("VTA", sale.saleId)} sale={sale} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
