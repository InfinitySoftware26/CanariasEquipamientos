"use client";

import { Sale } from "@/types/sales/sale.type";
import { useAuthStore } from "@/store/auth.store";
import { StaffRole } from "@/types/auth.types";

interface SaleInformationCardProps {
  sale: Sale;
}

export function SaleInformationCard({ sale }: SaleInformationCardProps) {
  const user = useAuthStore((state) => state.user);

  const isSeller = user?.role === StaffRole.SELLER;
  const products = sale.products ?? [];
  return (
    <section className="rounded-3xl border border-white/10 bg-[#111827] shadow-xl">
      <div className="border-b border-white/10 px-6 py-5">
        <h2 className="text-lg font-semibold text-white">
          Información de la venta
        </h2>

        <p className="mt-1 text-sm text-white/50">
          Datos generales de la operación comercial.
        </p>
      </div>

      <div className="grid gap-6 p-6 md:grid-cols-2 xl:grid-cols-3">
        <Info
          title="Cliente"
          value={`${sale.client?.name ?? "-"} ${sale.client?.surname ?? ""}`}
        />

        {isSeller ? (
          <>
            <Info
              title="Comisión (%)"
              value={`${(sale.sellerCommissionRate * 100).toFixed(0)} %`}
            />

            <Info
              title="Comisión"
              value={`$ ${sale.sellerCommission.toLocaleString()}`}
            />
          </>
        ) : (
          <Info
            title="Monto total"
            value={`$ ${sale.totalAmount.toLocaleString()}`}
          />
        )}

        <Info
          title="Cantidad de cuotas"
          value={sale.installmentsCount.toString()}
        />

        <Info
          title="Valor de cuota"
          value={`$ ${sale.installmentAmount.toLocaleString()}`}
        />

        <Info title="Frecuencia" value={sale.paymentFrequency} />

        <Info
          title="Fecha de venta"
          value={new Date(sale.saleDate).toLocaleDateString()}
        />

        <Info
          title="Primer vencimiento"
          value={new Date(sale.firstDueDate).toLocaleDateString()}
        />

        <Info title="Descuento" value={sale.hasDiscount ? "Sí" : "No"} />
      </div>

      <div className="border-t border-white/10 p-6">
        <p className="mb-2 text-sm font-medium text-white/60">Observaciones</p>

        <div className="rounded-2xl bg-[#0B1220] p-4 text-white/80">
          {sale.observation?.trim() ? sale.observation : "Sin observaciones."}
        </div>
      </div>

      {products.length > 0 && (
        <div className="border-t border-white/10 p-6">
          <p className="mb-4 text-sm font-medium text-white/60">Productos</p>

          <div className="flex flex-wrap gap-3">
            {products.map((product) => (
              <span
                key={product.saleProductId}
                className="
            rounded-full
            border
            border-[#F5A300]/20
            bg-[#F5A300]/10
            px-4
            py-2
            text-sm
            text-[#F5A300]
          "
              >
                {product.product?.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function Info({ title, value }: { title: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-white/40">{title}</p>

      <p className="mt-1 font-medium text-white">{value}</p>
    </div>
  );
}
