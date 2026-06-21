import { Sale } from "@/types/sales/sale.type";
import { SaleCard } from "./SaleCard";

export function SalesList({
  sales,
  loading,
  error,
}: {
  sales: Sale[];
  loading: boolean;
  error?: string;
}) {
  if (loading) return <p className="text-white/50">Cargando ventas...</p>;

  if (error) return <p className="text-red-400">{error}</p>;

  if (sales.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-white/10 p-12 text-center">
        <p className="text-white/40">No tenés ventas registradas</p>
      </div>
    );
  }

  return (
    <section className="space-y-5">
      {sales.map((sale) => (
        <SaleCard key={sale.saleId} sale={sale} />
      ))}
    </section>
  );
}
