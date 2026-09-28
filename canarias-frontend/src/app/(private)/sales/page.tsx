"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { SalesFilters } from "@/components/sale/SaleFilter";
import { SalesStats } from "@/components/sale/SalesStats";
import { SalesTable } from "@/components/sale/SaleTable";
import { AddButton } from "@/components/button/AddButton";
import { useSales } from "@/hooks/sales/useSale";
import { useSalesView } from "@/hooks/sales/useSalesView";
import { useSalesPagination } from "@/hooks/sales/useSalePagination";

export default function SalesPage() {
  const { sales, loading, error } = useSales();
  const router = useRouter();
  const {
    filter,
    setFilter,
    search,
    setSearch,
    filteredSales,
    stats,
    filters,
  } = useSalesView(sales);

  const { paginated, page, setPage, totalPages } =
    useSalesPagination(filteredSales);

  // Reiniciar la paginación cuando cambia el filtro o la búsqueda
  useEffect(() => {
    setPage(1);
  }, [filter, search, setPage]);

  return (
    <div className="space-y-10">
      {/* HEADER */}
      <section className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Ventas</h1>

          <p className="mt-1 text-white/70">Gestión y seguimiento comercial.</p>
        </div>

        <AddButton onClick={() => router.push("/sales/preload")}>
          Nueva venta
        </AddButton>
        
      </section>

      {/* STATS */}
      <SalesStats stats={stats} />

      {/* FILTERS */}
      <SalesFilters
        filters={filters}
        current={filter}
        onChange={setFilter}
        search={search}
        onSearch={setSearch}
      />
      {/* LIST */}
      <section className="space-y-4">
        {loading && <p className="text-white/60">Cargando ventas...</p>}

        {error && <p className="text-red-400">{error}</p>}

        {!loading && !error && paginated.length > 0 && (
          <SalesTable sales={paginated} />
        )}

        {!loading && !error && paginated.length === 0 && (
          <p className="text-white/50">No hay ventas.</p>
        )}
      </section>

      {/* PAGINATION */}
      {!loading && !error && totalPages > 1 && (
        <div className="flex justify-center gap-2 pt-2">
          {Array.from({ length: totalPages }, (_, i) => {
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
