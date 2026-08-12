"use client";

import { useEffect } from "react";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

import { usePayments } from "@/hooks/payments/usePayments";
import { usePaymentsPagination } from "@/hooks/payments/usePaymentsPagination";
import { usePaymentsView } from "@/hooks/payments/usePaymentsView";

import { PaymentStats } from "@/components/payments/PaymentsStats";
import { PaymentFilters } from "@/components/payments/PaymentsFilters";
import { PaymentTable } from "@/components/payments/PaymentsTable";

export default function PaymentsPage() {
  const router = useRouter();

  const { payments, loading, error } = usePayments();

  const {
    search,
    setSearch,
    filter,
    setFilter,
    filteredPayments,
    filters,
    stats,
  } = usePaymentsView(payments);

  const { paginated, page, setPage, totalPages } =
    usePaymentsPagination(filteredPayments);

  useEffect(() => {
    setPage(1);
  }, [filter, search, setPage]);

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Pagos</h1>

          <p className="mt-2 text-white/60">
            Registro y seguimiento de cobranzas.
          </p>
        </div>

        <button
          onClick={() => router.push("/payments/new")}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#F5A300] px-5 py-3 font-semibold text-black transition hover:bg-[#ffb21c] active:scale-[0.98]"
        >
          <Plus size={20} />
          Registrar pago
        </button>
      </section>

      {/* STATS */}
      <PaymentStats stats={stats} />

      {/* FILTERS */}
      <PaymentFilters
        filters={filters}
        current={filter}
        onChange={setFilter}
        search={search}
        onSearch={setSearch}
      />

      {/* TABLE */}
      <section>
        {loading && <p className="text-white/60">Cargando pagos...</p>}

        {error && <p className="text-red-400">{error}</p>}

        {!loading && !error && paginated.length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-[#0E1726] p-8 text-center">
            <p className="text-white/60">No hay pagos registrados.</p>

            <button
              onClick={() => router.push("/payments/new")}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#F5A300] px-4 py-2 font-medium text-black transition hover:bg-[#ffb21c]"
            >
              <Plus size={18} />
              Registrar el primer pago
            </button>
          </div>
        )}

        {!loading && !error && paginated.length > 0 && (
          <PaymentTable payments={paginated} />
        )}
      </section>

      {/* PAGINATION */}
      {!loading && !error && totalPages > 1 && (
        <div className="flex flex-wrap justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => {
            const pageNumber = i + 1;

            return (
              <button
                key={pageNumber}
                onClick={() => setPage(pageNumber)}
                className={`h-10 w-10 rounded-xl transition ${
                  page === pageNumber
                    ? "bg-[#F5A300] font-semibold text-black"
                    : "border border-white/10 bg-slate-900 text-white hover:bg-slate-800"
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
