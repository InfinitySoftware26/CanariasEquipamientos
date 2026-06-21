"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { getSaleById } from "@/services/sales.service";

import { Sale } from "@/types/sales/sale.type";
import { AdminSalePanel } from "@/components/sale/AdminSalePanel";
import { CollectorAssignPanel } from "@/components/sale/CollectorAssingPanel";
import { SalePipeline } from "@/components/sale/SalePipeLine";

export default function SaleDetailPage() {
  const { id } = useParams<{ id: string }>();

  const [sale, setSale] = useState<Sale | null>(null);
  const [loading, setLoading] = useState(true);

  const loadSale = async () => {
    try {
      setLoading(true);

      const data = await getSaleById(id);

      setSale(data);
    } catch (error) {
      console.error("ERROR CARGANDO VENTA:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadSale();
  }, [id]);

  if (loading) return <div>Cargando venta...</div>;
  if (!sale) return <div>No existe la venta</div>;

  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold">Venta #{sale.saleId}</h1>

        <p className="text-sm text-gray-500">
          Estado: <b>{sale.status}</b>
        </p>
      </div>

      {/* INFO PRINCIPAL */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p>
            <b>Cliente ID:</b> {sale.clientId}
          </p>
          <p>
            <b>Total:</b> ${sale.totalAmount}
          </p>
          <p>
            <b>Cuotas:</b> {sale.installmentsCount}
          </p>
        </div>

        <div>
          <p>
            <b>Fecha venta:</b> {sale.saleDate}
          </p>
          <p>
            <b>Creada:</b> {sale.createdAt}
          </p>
        </div>
      </div>

      {/* PIPELINE VISUAL */}
      <SalePipeline status={sale.status} />

      {/* ACCIONES ADMIN */}
      <AdminSalePanel sale={sale} onRefresh={loadSale} />

      {/* ASIGNAR COLLECTOR */}
      <CollectorAssignPanel sale={sale} onRefresh={loadSale} />
    </div>
  );
}
