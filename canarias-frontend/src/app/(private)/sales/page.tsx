"use client";

import { useEffect } from "react";

import { SaleCard } from "@/components/sale/SaleCard";
import { SalesFilters } from "@/components/sale/SaleFilter";
import { SalesStats } from "@/components/sale/SalesStats";

import { useSales } from "@/hooks/sales/useSale";
import { useSalesView } from "@/hooks/sales/useSalesView";
import { useSalesPagination } from "@/hooks/sales/useSalePagination";

import { Sale } from "@/types/sales/sale.type";

export default function SalesPage() {
  const { sales, loading, error } = useSales();

  const { filter, setFilter, filteredSales, stats, filters } =
    useSalesView(sales);

  const { paginated, page, setPage, totalPages } =
    useSalesPagination(filteredSales);

  // reset page cuando cambia filtro
  useEffect(() => {
    setPage(1);
  }, [filter, setPage]);

  return (
    <div className="space-y-10">
      {/* HEADER */}
      <section>
        <h1 className="text-3xl font-bold text-white">Ventas</h1>
        <p className="mt-2 text-white/60">Gestión y seguimiento comercial.</p>
      </section>

      {/* FILTERS */}
      <SalesFilters filters={filters} current={filter} onChange={setFilter} />

      {/* STATS */}
      <SalesStats stats={stats} />
      {/* LIST */}
      <section className="space-y-4">
        {loading && <p className="text-white/60">Cargando ventas...</p>}

        {error && <p className="text-red-400">{error}</p>}

        {!loading &&
          paginated.map((sale: Sale) => (
            <SaleCard key={sale.saleId} sale={sale} />
          ))}

        {!loading && paginated.length === 0 && (
          <p className="text-white/50">No hay ventas.</p>
        )}
      </section>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 pt-2">
          {Array.from({ length: totalPages }).map((_, i) => {
            console.log("FILTER:", filter);
            console.log("FILTERED:", filteredSales.length);
            const pageNumber = i + 1;

            return (
              <button
                key={pageNumber}
                onClick={() => setPage(pageNumber)}
                className={`h-10 w-10 rounded-xl border border-white/10 transition ${
                  page === pageNumber
                    ? "bg-[#F5A300] text-black"
                    : "bg-slate-900 text-white hover:bg-slate-800"
                }`}
              >
                {pageNumber}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
