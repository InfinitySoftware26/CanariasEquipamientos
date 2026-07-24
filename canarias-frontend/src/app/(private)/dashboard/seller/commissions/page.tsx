"use client";

import {
  Calendar,
  Wallet,
  CheckCircle2,
  Target,
  FileText,
  TrendingUp,
} from "lucide-react";

import { getDisplayCode } from "@/lib/sales/displayCode";
import { useSellerCommissions } from "@/hooks/seller/useSellerCommission";
import { CommissionCard } from "@/components/sale/details/ComissionCard";

export default function SellerCommissionsPage() {
  const { closedSales, monthlyCommission, totalCommission, averageCommission } =
    useSellerCommissions();

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-4xl font-bold text-[#F5A300]">Mis comisiones</h1>

        <p className="mt-2 text-white/60">
          Seguimiento de las comisiones generadas por tus ventas cerradas.
        </p>
      </section>

      <section className="grid gap-5 lg:grid-cols-4">
        <CommissionCard
          icon={<Calendar size={22} />}
          title="Comisión mensual"
          value={`$ ${monthlyCommission.toLocaleString("es-AR")}`}
          subtitle="Ventas cerradas este mes"
          extra={closedSales.length.toString()}
        />

        <CommissionCard
          icon={<Wallet size={22} />}
          title="Comisión acumulada"
          value={`$ ${totalCommission.toLocaleString("es-AR")}`}
          subtitle="Desde tu registro"
        />

        <CommissionCard
          icon={<CheckCircle2 size={22} />}
          title="Ventas cerradas"
          value={closedSales.length.toString()}
          subtitle="Totales"
        />

        <CommissionCard
          icon={<Target size={22} />}
          title="Promedio por venta"
          value={`$ ${averageCommission.toLocaleString("es-AR")}`}
          subtitle="Comisión promedio"
        />
      </section>

      <section className="rounded-3xl border border-white/10 bg-[#111827] p-6 shadow-xl">
        <div className="mb-6 flex items-center gap-3">
          <TrendingUp size={20} className="text-[#F5A300]" />

          <h2 className="text-2xl font-semibold text-white">
            Historial mensual
          </h2>
        </div>

        <div className="flex h-72 items-center justify-center rounded-2xl border border-dashed border-white/10 text-white/40">
          Próximamente gráfico mensual
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-[#111827] shadow-xl">
        <div className="border-b border-white/10 p-6">
          <div className="flex items-center gap-3">
            <FileText size={20} className="text-[#F5A300]" />

            <h2 className="text-2xl font-semibold text-white">
              Ventas que generaron comisión
            </h2>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 text-left text-sm text-white/50">
              <tr>
                <th className="px-6 py-4">Venta</th>
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4">Producto</th>
                <th className="px-6 py-4">Fecha cierre</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4 text-right">Comisión</th>
              </tr>
            </thead>

            <tbody>
              {closedSales.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center text-white/40">
                    Aún no tenés ventas cerradas
                  </td>
                </tr>
              ) : (
                closedSales.map((sale) => (
                  <tr
                    key={sale.saleId}
                    className="border-b border-white/5 hover:bg-white/5"
                  >
                    <td className="px-6 py-4">
                      {getDisplayCode("VTA", sale.saleId)}
                    </td>

                    <td className="px-6 py-4">
                      {sale.client?.name} {sale.client?.surname}
                    </td>

                    <td className="px-6 py-4">
                      {sale.products?.map((p) => p.product?.name).join(", ")}
                    </td>

                    <td className="px-6 py-4">
                      {new Date(sale.saleDate).toLocaleDateString("es-AR")}
                    </td>

                    <td className="px-6 py-4">Cerrada</td>

                    <td className="px-6 py-4 text-right font-semibold text-[#F5A300]">
                      ${Number(sale.sellerCommission).toLocaleString("es-AR")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
