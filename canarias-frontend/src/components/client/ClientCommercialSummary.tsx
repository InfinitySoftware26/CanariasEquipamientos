"use client";

import { useClientCommercialSummary } from "@/hooks/clients/useClientCommercialSummary";

import { ClientInstallmentsSection } from "./ClientInstallmentsSection";
import { ClientSalesSection } from "./ClientSalesSection";

interface Props {
  clientId: string;
}

export function ClientCommercialSummary({ clientId }: Props) {
  const { sales, installments, loading, error, refresh, stats } =
    useClientCommercialSummary(clientId);

  const kpis = [
    { title: "Ventas activas", value: stats.activeSalesCount },
    { title: "Cuotas pendientes", value: stats.pendingInstallmentsCount },
    {
      title: "Deuda total",
      value: `$ ${stats.totalDebt.toLocaleString()}`,
    },
    {
      title: "Último pago",
      value: stats.lastPaymentDate
        ? new Date(stats.lastPaymentDate).toLocaleDateString()
        : "Sin pagos registrados",
    },
  ];

  return (
    <section className="space-y-8">
      <h2 className="text-xl font-bold text-white">Situación comercial</h2>

      {error && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-center">
          <p className="text-red-300">{error}</p>

          <button
            onClick={refresh}
            className="mt-4 inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 font-medium text-white transition hover:bg-white/5"
          >
            Reintentar
          </button>
        </div>
      )}

      {!error && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {kpis.map((kpi) => (
              <div
                key={kpi.title}
                className="rounded-3xl border border-white/10 bg-[#0E1726] p-6"
              >
                <p className="text-sm text-white/50">{kpi.title}</p>

                <h3 className="mt-3 text-2xl font-bold text-white">
                  {loading ? "—" : kpi.value}
                </h3>
              </div>
            ))}
          </div>

          <ClientInstallmentsSection
            clientId={clientId}
            installments={installments}
            loading={loading}
          />

          <ClientSalesSection
            clientId={clientId}
            sales={sales}
            loading={loading}
          />
        </>
      )}
    </section>
  );
}
