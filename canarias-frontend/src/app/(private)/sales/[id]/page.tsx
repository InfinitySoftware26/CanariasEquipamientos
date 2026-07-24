"use client";

import { useParams } from "next/navigation";

import { useAuthStore } from "@/store/auth.store";
import { useSaleDetail } from "@/hooks/sales/useSaleDetails";
import { StaffRole } from "@/types/auth.types";

export default function SaleDetailPage() {
  const params = useParams();

  const saleId = params.id as string;

  const user = useAuthStore((state) => state.user);

  const { sale, loading, error } = useSaleDetail(saleId);

  const isSeller = user?.role === StaffRole.SELLER;

  if (loading) {
    return <div className="text-white">Cargando venta...</div>;
  }

  if (error || !sale) {
    return <div className="text-red-400">No se pudo cargar la venta</div>;
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <h1 className="text-2xl font-bold text-white">Detalle de venta</h1>

        <p className="mt-2 text-white/50">
          Estado:
          <span className="ml-2 text-[#ffa408]">{sale.status}</span>
        </p>
      </section>

      {/* CLIENTE */}
      <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-lg font-semibold text-white">Cliente</h2>

        <p className="mt-3 text-white">
          {sale.client?.name} {sale.client?.surname}
        </p>

        <p className="text-white/50">DNI: {sale.client?.documentNumber}</p>

        <p className="text-white/50">Tel: {sale.client?.phone}</p>
      </section>

      {/* PRODUCTO */}
      <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-lg font-semibold text-white">Producto</h2>

        {sale.products?.map((product) => (
          <div key={product.saleProductId} className="mt-4">
            <p className="text-white">{product.product?.name}</p>

            <p className="text-white/50">Cantidad: {product.quantity}</p>

            {/* 
              Solo roles internos ven precio real
            */}
            {!isSeller && (
              <p className="text-white/50">
                Precio: ${Number(product.unitPrice).toLocaleString("es-AR")}
              </p>
            )}
          </div>
        ))}
      </section>

      {/* INFORMACION FINANCIERA */}
      {!isSeller && (
        <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-semibold text-white">Financiación</h2>

          <div className="grid md:grid-cols-3 gap-4 mt-4">
            <div>
              <p className="text-white/50">Total venta</p>

              <p className="text-white text-xl">
                ${Number(sale.totalAmount).toLocaleString("es-AR")}
              </p>
            </div>

            <div>
              <p className="text-white/50">Cuotas</p>

              <p className="text-white text-xl">{sale.installmentsCount}</p>
            </div>

            <div>
              <p className="text-white/50">Valor cuota</p>

              <p className="text-white text-xl">
                ${Number(sale.installmentAmount).toLocaleString("es-AR")}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* COMISION */}

      <section
        className="
        rounded-3xl
        border
        border-[#ffa408]/30
        bg-[#ffa408]/10
        p-6
        "
      >
        <p className="text-white/60">
          {isSeller ? "Tu comisión" : "Comisión del vendedor"}
        </p>

        <p
          className="
          text-3xl
          font-bold
          text-[#ffa408]
          "
        >
          ${Number(sale.sellerCommission).toLocaleString("es-AR")}
        </p>
      </section>
    </div>
  );
}
