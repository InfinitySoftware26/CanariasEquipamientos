"use client";

import { useRouter } from "next/navigation";

import { getSaleStatusLabel } from "@/lib/sales/getSalesStatusLabel";
import { Sale } from "@/types/sales/sale.type";
import { SaleStatusBadge } from "./SalesStatusBadge";

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-white/40">{label}</p>
      <p className="text-white">{value}</p>
    </div>
  );
}

const statusLabelMap: Record<string, string> = {
  PENDING_ADMIN_VALIDATION: "Pendiente de Validación",
  REJECTED_ADMIN: "Rechaza por administracion",
  PENDING_ENVIRONMENTAL_VISIT: "Pendiente de Visita",
  PENDING_DELIVERY: "Listo para Entrega",
  ENVIRONMENTAL_REJECTED: "Visita ambiental rechazada",
  CLOSED: "Cerrada",
};

const statusColorMap: Record<string, string> = {
  PENDING_ADMIN_VALIDATION: "text-red-300 border-red-500/30 bg-red-500/10",
  PENDING_ENVIRONMENTAL_VISIT:
    "text-orange-300 border-orange-500/30 bg-orange-500/10",
  PENDING_DELIVERY: "text-amber-300 border-amber-500/30 bg-amber-500/10",
  ENVIRONMENTAL_REJECTED:
    "text-red-300 border-emerald-500/30 bg-emerald-500/10",
  REJECTED_ADMIN: "text-red-300 border-emerald-500/30 bg-emerald-500/10",
  CLOSED: "text-emerald-300 border-emerald-500/30 bg-emerald-500/10",
};

export function SaleCard({ sale }: { sale: Sale }) {
  const router = useRouter();

  /**
   * 🔥 FIX CLAVE:
   * Normalizamos SIEMPRE el status para evitar crudos o inconsistencias
   */
  const status = (sale.status ?? "").toUpperCase();

  const badge = getSaleStatusLabel(status);

  const color =
    statusColorMap[status] ?? "text-white border-white/20 bg-white/5";

  const label = statusLabelMap[status] ?? status;

  return (
    <article
      onClick={() => router.push(`/sales/${sale.saleId}`)}
      className={`rounded-3xl border p-6 transition-all duration-300 cursor-pointer hover:bg-white/5 hover:scale-[1.01] ${color}`}
    >
      <div className="flex justify-between gap-6">
        <div className="space-y-5">
          <div>
            <Info label="Venta" value={`#${sale.saleId.slice(0, 8)}`} />

            <Info
              label="Cliente"
              value={
                sale.client
                  ? `${sale.client.name} ${sale.client.surname}`
                  : sale.clientId
              }
            />

            <Info
              label="Producto"
              value={
                sale.products?.length
                  ? sale.products
                      .map((p) => p.product?.name ?? p.productId)
                      .join(", ")
                  : "-"
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Info label="Cuotas" value={sale.installmentsCount} />
            <Info label="Descuento" value={sale.hasDiscount ? "Sí" : "No"} />
            <Info
              label="Fecha"
              value={new Date(sale.saleDate).toLocaleDateString("es-AR")}
            />
          </div>

          <div>
            <p className="text-xs text-white/40">Monto</p>
            <p className="text-3xl font-bold text-[#F5A300]">
              ${Number(sale.totalAmount).toLocaleString("es-AR")}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <SaleStatusBadge {...badge} />

          <span
            className={`rounded-full border px-3 py-1 text-xs font-semibold ${color}`}
          >
            {label}
          </span>
        </div>
      </div>
    </article>
  );
}
