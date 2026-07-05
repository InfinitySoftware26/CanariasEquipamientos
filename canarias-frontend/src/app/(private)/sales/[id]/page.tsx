"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { getSaleById } from "@/services/sales.service";

import { Sale } from "@/types/sales/sale.type";

import { SalePipeline } from "@/components/sale/SalePipeLine";

import { useRolePermissions } from "@/hooks/auth/useRolePermissions";
import { AdminSalePanel } from "@/components/sale/details/AdminSalePanel";
import { CollectorAssignPanel } from "@/components/sale/details/CollectorAssingPanel";
import { EnvironmentalVisitPanel } from "@/components/collector/EnviromentalVisitPanel";
import { SaleHeader } from "@/components/sale/details/SalesHeader";
import { SaleInformationCard } from "@/components/sale/details/SaleInformationCard";

export default function SaleDetailPage() {
  const { id } = useParams<{ id: string }>();

  const [sale, setSale] = useState<Sale | null>(null);
  const [loading, setLoading] = useState(true);
  const permissions = useRolePermissions();

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
  console.log("ROLE:", permissions);
  console.log("STATUS:", sale.status);
  return (
    <div className="space-y-6 p-6">
      <SaleHeader sale={sale} />

      <SaleInformationCard sale={sale} />

      <SalePipeline status={sale.status} />

      {permissions.canValidateSale && (
        <AdminSalePanel sale={sale} onRefresh={loadSale} />
      )}

      {permissions.canAssignCollector && (
        <CollectorAssignPanel sale={sale} onRefresh={loadSale} />
      )}

      {permissions.canValidateEnvironmentalVisit && (
        <EnvironmentalVisitPanel sale={sale} onRefresh={loadSale} />
      )}
    </div>
  );
}
