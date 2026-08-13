"use client";

import Link from "next/link";

import { Sale } from "@/types/sales/sale.type";
import { getSaleStatusLabel } from "@/lib/sales/getSalesStatusLabel";
import { SaleStatusBadge } from "@/components/sale/SalesStatusBadge";

interface Props {
  clientId: string;
  sales: Sale[];
  loading: boolean;
}

const MAX_VISIBLE = 3;

export function ClientSalesSection({ clientId, sales, loading }: Props) {
  const visible = sales.slice(0, MAX_VISIBLE);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white">Ventas</h3>

        {sales.length > MAX_VISIBLE && (
          <Link
            href={`/sales?clientId=${clientId}`}
            className="text-sm font-medium text-[#F5A300] hover:underline"
          >
            Ver todas
          </Link>
        )}
      </div>

      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 3 }, (_, i) => (
            <div
              key={i}
              className="h-14 animate-pulse rounded-2xl border border-white/10 bg-white/5"
            />
          ))}
        </div>
      )}

      {!loading && visible.length === 0 && (
        <div className="rounded-2xl border border-white/10 bg-[#0E1726] p-6 text-center">
          <p className="text-white/60">Este cliente no tiene ventas.</p>
        </div>
      )}

      {!loading && visible.length > 0 && (
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#0E1726]">
          <div className="overflow-x-auto">
            <table className="min-w-[600px] w-full">
              <thead className="border-b border-white/10 bg-white/5">
                <tr className="text-left text-xs uppercase tracking-wider text-white/50">
                  <th className="px-6 py-4">Fecha</th>

                  <th className="px-6 py-4">Monto</th>

                  <th className="px-6 py-4">Estado</th>

                  <th className="px-6 py-4"></th>
                </tr>
              </thead>

              <tbody>
                {visible.map((sale) => {
                  const status = getSaleStatusLabel(sale.status);

                  return (
                    <tr
                      key={sale.saleId}
                      className="border-b border-white/5 transition hover:bg-white/5"
                    >
                      <td className="px-6 py-4 text-white/80">
                        {new Date(sale.saleDate).toLocaleDateString()}
                      </td>

                      <td className="px-6 py-4 font-semibold text-white">
                        $ {Number(sale.totalAmount).toLocaleString()}
                      </td>

                      <td className="px-6 py-4">
                        <SaleStatusBadge
                          label={status.label}
                          className={status.className}
                        />
                      </td>

                      <td className="px-6 py-4">
                        <Link
                          href={`/sales/${sale.saleId}`}
                          className="rounded-lg bg-[#F5A300] px-3 py-2 text-sm font-medium text-black transition hover:opacity-90"
                        >
                          Ver
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
