"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { getSaleById } from "@/services/sales.service";

import { Sale } from "@/types/sales/sale.type";
import { AdminSalePanel } from "@/components/sale/AdminSalePanel";
import { SalePipeline } from "@/components/sale/SalePipeLine";
import { CollectorAssignPanel } from "@/components/sale/CollectorAssingPanel";

export default function SaleDetailPage() {
  const { id } = useParams<{ id: string }>();

  const [sale, setSale] = useState<Sale | null>(null);
  const [loading, setLoading] = useState(true);

  const loadSale = async () => {
    if (!id) return;

    try {
      setLoading(true);

      const data = await getSaleById(id);

      setSale(data);
    } catch (error) {
      console.error("ERROR CARGANDO VENTA:", error);
      setSale(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSale();
  }, [id]);

  if (loading) {
    return <div className="p-6 text-gray-400">Cargando venta...</div>;
  }

  if (!sale) {
    return <div className="p-6 text-red-400">No existe la venta</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-white">Venta #{sale.saleId}</h1>

        <p className="text-sm text-gray-400">
          Estado: <b className="text-white">{sale.status?.trim()}</b>
        </p>
      </div>

      {/* INFO PRINCIPAL */}
      <div className="grid grid-cols-2 gap-4 text-gray-300">
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
      <SalePipeline status={sale.status?.trim() as Sale["status"]} />

      {/* ACCIONES ADMIN */}
      <AdminSalePanel sale={sale} onRefresh={loadSale} />

      {/* ASIGNAR COLLECTOR */}
      <CollectorAssignPanel sale={sale} onRefresh={loadSale} />
    </div>
  );
}
