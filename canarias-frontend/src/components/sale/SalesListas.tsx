import { Sale } from "@/types/sales/sale.type";
import { SalesTable } from "./SaleTable";

interface Props {
  sales: Sale[];
  loading: boolean;
  error?: string;
}

export function SalesList({ sales, loading, error }: Props) {
  if (loading)
    return (
      <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center">
        <p className="text-white/50">Cargando ventas...</p>
      </div>
    );

  if (error)
    return (
      <div className="rounded-3xl border border-red-500/20 bg-red-500/5 p-8 text-center">
        <p className="text-red-400">{error}</p>
      </div>
    );

  if (!sales.length)
    return (
      <div className="rounded-3xl border border-dashed border-white/10 p-12 text-center">
        <p className="text-white/40">No tenés ventas registradas</p>
      </div>
    );

  return <SalesTable sales={sales} />;
}
