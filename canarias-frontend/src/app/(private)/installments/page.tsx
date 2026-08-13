"use client";

import { useEffect, useState } from "react";

import { useOverdueInstallments } from "@/hooks/installments/useOverdueInstallments";
import { useInstallmentsView } from "@/hooks/installments/useInstallmentsView";
import { useInstallmentsPagination } from "@/hooks/installments/useInstallmentsPagination";
import { usePayInstallment } from "@/hooks/installments/usePayInstallment";
import { useAuthStore } from "@/store/auth.store";
import { StaffRole } from "@/types/auth.types";
import { Installment } from "@/types/installments/installment.types";

import { InstallmentsStats } from "@/components/installments/InstallmentsStats";
import { InstallmentsFilters } from "@/components/installments/InstallmentsFilters";
import { InstallmentList } from "@/components/installments/InstallmentList";
import { PayInstallmentModal } from "@/components/installments/PayInstallmentModal";

const CAN_PAY_ROLES = [
  StaffRole.ADMIN,
  StaffRole.MANAGER,
  StaffRole.SUPER_ADMIN,
  StaffRole.COLLECTOR,
];

export default function InstallmentsPage() {
  const activeRole = useAuthStore((state) => state.activeRole);
  const canPay = !!activeRole && CAN_PAY_ROLES.includes(activeRole);

  const { installments, loading, error, refresh } = useOverdueInstallments();

  const { search, setSearch, filter, setFilter, filteredInstallments, filters, stats } =
    useInstallmentsView(installments);

  const { paginated, page, setPage, totalPages } =
    useInstallmentsPagination(filteredInstallments);

  const { pay, loading: paying } = usePayInstallment();

  const [selected, setSelected] = useState<Installment | null>(null);

  useEffect(() => {
    setPage(1);
  }, [filter, search, setPage]);

  async function handlePay(installmentId: string, amount: number) {
    await pay(installmentId, amount);

    setSelected(null);
    refresh();
  }

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <section>
        <h1 className="text-3xl font-bold text-white">Cuotas</h1>

        <p className="mt-2 text-white/60">
          Cuotas vencidas pendientes de cobro.
        </p>
      </section>

      {/* STATS */}
      <InstallmentsStats stats={stats} />

      {/* FILTERS */}
      <InstallmentsFilters
        filters={filters}
        current={filter}
        onChange={setFilter}
        search={search}
        onSearch={setSearch}
      />

      {/* TABLE */}
      <section>
        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 5 }, (_, i) => (
              <div
                key={i}
                className="h-14 animate-pulse rounded-2xl border border-white/10 bg-white/5"
              />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center">
            <p className="text-red-300">{error}</p>

            <button
              onClick={refresh}
              className="mt-4 inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 font-medium text-white transition hover:bg-white/5"
            >
              Reintentar
            </button>
          </div>
        )}

        {!loading && !error && paginated.length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-[#0E1726] p-8 text-center">
            <p className="text-white/60">No hay cuotas vencidas.</p>
          </div>
        )}

        {!loading && !error && paginated.length > 0 && (
          <InstallmentList
            installments={paginated}
            onPay={canPay ? setSelected : undefined}
          />
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

      {/* PAY MODAL */}
      <PayInstallmentModal
        installment={selected}
        loading={paying}
        onClose={() => setSelected(null)}
        onSubmit={handlePay}
      />
    </div>
  );
}
