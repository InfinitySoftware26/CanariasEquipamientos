"use client";

import { useParams } from "next/navigation";

import { useAuthStore } from "@/store/auth.store";
import { useSaleDetail } from "@/hooks/sales/useSaleDetails";

import { getSaleStatusLabel } from "@/lib/sales/getSalesStatusLabel";
import { getSalePermissions } from "@/lib/sales/getSalePermissions";
import { SaleStatusBadge } from "@/components/sale/SalesStatusBadge";
import { AdminSalePanel } from "@/components/sale/details/AdminSalePanel";
import { CollectorSalePanel } from "@/components/sale/details/CollectorAssingPanel";

export default function SaleDetailPage() {
  const params = useParams();

  const saleId = params.id as string;

  const user = useAuthStore((state) => state.user);

  const { sale, loading, error, refresh } = useSaleDetail(saleId);

  const permissions = getSalePermissions(user?.role);

  if (loading) {
    return <div className="text-white">Cargando venta...</div>;
  }

  if (error || !sale) {
    return <div className="text-red-400">No se pudo cargar la venta</div>;
  }

  const badge = getSaleStatusLabel(sale.status);

  return (
    <div className="space-y-6">
      {/* HEADER */}

      <section
        className="
        rounded-3xl
        border
        border-white/10
        bg-white/5
        p-6
        "
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1
              className="
              text-2xl
              font-bold
              text-white
              "
            >
              Detalle de venta
            </h1>

            <p
              className="
              mt-2
              text-white/50
              "
            >
              Venta #{sale.saleId}
            </p>
          </div>

          <SaleStatusBadge {...badge} />
        </div>
      </section>

      {/* CLIENTE */}

      <section
        className="
        rounded-3xl
        border
        border-white/10
        bg-white/5
        p-6
        "
      >
        <h2
          className="
          text-lg
          font-semibold
          text-white
          "
        >
          Cliente
        </h2>

        <div className="mt-4 space-y-1">
          <p className="text-white">
            {sale.client?.name} {sale.client?.surname}
          </p>

          <p className="text-white/50">DNI: {sale.client?.documentNumber}</p>

          <p className="text-white/50">Tel: {sale.client?.phone}</p>
        </div>
      </section>

      {/* PRODUCTOS */}

      <section
        className="
        rounded-3xl
        border
        border-white/10
        bg-white/5
        p-6
        "
      >
        <h2
          className="
          text-lg
          font-semibold
          text-white
          "
        >
          Productos
        </h2>

        <div className="mt-4 space-y-4">
          {sale.products?.map((product) => (
            <div
              key={product.saleProductId}
              className="
                rounded-2xl
                bg-black/20
                p-4
                "
            >
              <p className="text-white">{product.product?.name}</p>

              <p
                className="
                  text-white/50
                  "
              >
                Cantidad: {product.quantity}
              </p>

              {permissions?.canViewSaleAmount && (
                <p
                  className="
                      text-white/50
                      "
                >
                  Precio: ${Number(product.unitPrice).toLocaleString("es-AR")}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* FINANCIACION */}

      {permissions?.canViewSaleAmount && (
        <section
          className="
          rounded-3xl
          border
          border-white/10
          bg-white/5
          p-6
          "
        >
          <h2
            className="
            text-lg
            font-semibold
            text-white
            "
          >
            Financiación
          </h2>

          <div
            className="
            mt-4
            grid
            gap-4
            md:grid-cols-3
            "
          >
            <Info
              label="Total venta"
              value={`$${Number(sale.totalAmount).toLocaleString("es-AR")}`}
            />

            <Info label="Cuotas" value={String(sale.installmentsCount)} />

            <Info
              label="Valor cuota"
              value={`$${Number(sale.installmentAmount).toLocaleString(
                "es-AR",
              )}`}
            />
          </div>
        </section>
      )}

      {/* COMISION VENDEDOR */}

      {permissions?.canViewOwnCommission && (
        <section
          className="
          rounded-3xl
          border
          border-[#ffa408]/30
          bg-[#ffa408]/10
          p-6
          "
        >
          <p className="text-white/60">Tu comisión</p>

          <p
            className="
            mt-2
            text-3xl
            font-bold
            text-[#ffa408]
            "
          >
            ${Number(sale.sellerCommission).toLocaleString("es-AR")}
          </p>
        </section>
      )}

      {/* ADMIN */}

      {(permissions?.canValidateSale || permissions?.canAssignCollector) && (
        <AdminSalePanel sale={sale} onRefresh={refresh} />
      )}

      {/* COBRADOR */}

      {permissions?.canManageCollection && (
        <CollectorSalePanel sale={sale} onRefresh={refresh} />
      )}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-white/50">{label}</p>

      <p
        className="
        mt-1
        text-xl
        text-white
        "
      >
        {value}
      </p>
    </div>
  );
}
