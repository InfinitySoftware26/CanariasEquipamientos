"use client";

import { SalesFilters } from "@/components/sale/SaleFilter";
import { SalesList } from "@/components/sale/SalesListas";
import { SalesStats } from "@/components/sale/SalesStats";
import { useSalesPagination } from "@/hooks/sales/useSalePagination";
import { useSalesView } from "@/hooks/sales/useSalesView";
import { useSellerSales } from "@/hooks/sales/useSellerSale";
import { useEffect } from "react";

export default function MySalesPage() {
  const { sales, loading, error } = useSellerSales();

  const { filter, setFilter, filteredSales, stats, filters } =
    useSalesView(sales);

  const { paginated, page, setPage, totalPages } =
    useSalesPagination(filteredSales);

  useEffect(() => setPage(1), [filter, setPage]);

  return (
    <div className="space-y-10">
      <SalesStats stats={stats} />

      <SalesFilters filters={filters} current={filter} onChange={setFilter} />

      <SalesList
        sales={paginated}
        loading={loading}
        error={error ?? undefined}
      />

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalPages }).map((_, i) => {
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
