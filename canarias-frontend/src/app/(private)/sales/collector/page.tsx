"use client";

import { useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";

import { SalesFilters } from "@/components/sale/SaleFilter";
import { SalesList } from "@/components/sale/SalesListas";

import { useSalesPagination } from "@/hooks/sales/useSalePagination";
import { useCollectorSales } from "@/hooks/collector/useCollectorSale";

type FilterType = "ALL" | "PENDING" | "CLOSED";

const PENDING_STATUSES = [
  "pending_admin_validation",
  "pending_environmental_visit",
  "pending_delivery",
];

const CLOSED_STATUSES = ["closed"];

const toFilterType = (status: string | null): FilterType => {
  if (!status) return "ALL";

  if (PENDING_STATUSES.includes(status)) return "PENDING";

  if (CLOSED_STATUSES.includes(status)) return "CLOSED";

  return "ALL";
};

export default function CollectorSalesPage() {
  const searchParams = useSearchParams();
  const status = searchParams.get("status");

  const { sales, loading, error } = useCollectorSales();

  /**
   * 🔥 FILTRO REAL CORRECTO
   */
  const filteredByStatus = useMemo(() => {
    if (!status || status === "ALL") return sales;

    if (status === "PENDING") {
      return sales.filter((sale) => PENDING_STATUSES.includes(sale.status));
    }

    if (status === "CLOSED") {
      return sales.filter((sale) => CLOSED_STATUSES.includes(sale.status));
    }

    return sales;
  }, [sales, status]);

  /**
   * PAGINACIÓN
   */
  const { paginated, page, setPage, totalPages } =
    useSalesPagination(filteredByStatus);

  useEffect(() => {
    setPage(1);
  }, [status, setPage]);

  return (
    <div className="space-y-10">
      {/* FILTROS UI */}
      <SalesFilters
        filters={[
          { label: "Todos", value: "ALL" },
          { label: "Pendientes", value: "PENDING" },
          { label: "Cerrados", value: "CLOSED" },
        ]}
        current={toFilterType(status)}
        onChange={(value) => {
          const query =
            value === "ALL"
              ? ""
              : value === "PENDING"
                ? "?status=PENDING"
                : "?status=CLOSED";

          window.history.pushState({}, "", `/sales/collector${query}`);
        }}
      />

      {/* LISTA */}
      <SalesList
        sales={paginated}
        loading={loading}
        error={error ?? undefined}
      />

      {/* PAGINACIÓN */}
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
