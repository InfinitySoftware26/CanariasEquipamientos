"use client";

import { useEffect, useMemo, useState } from "react";

import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  DollarSign,
  FileText,
  Lock,
  Map as MapIcon,
  Route,
  TrendingUp,
  Users,
} from "lucide-react";

import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { KpiCard } from "@/components/dashboard/KpiCard";

import { useSales } from "@/hooks/sales/useSale";

import { getOverdueInstallments } from "@/services/installments/installments.service";
import { getPayments } from "@/services/payments/payments.service";
import { getClosures } from "@/services/closures/closures.service";

import type { Installment } from "@/types/installments/installment.types";
import type { Sale } from "@/types/sales/sale.type";
import type { Payment } from "@/types/payments/payment.types";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(value);
}

function isCurrentMonth(dateValue?: string | null) {
  if (!dateValue) return false;

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return false;
  }

  const now = new Date();

  return (
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  );
}

type SellerRankingItem = {
  staffId: string;
  name: string;
  sales: number;
  amount: number;
};

type ClosureDashboardItem = {
  status?: string | null;
};

export default function ManagerDashboard() {
  const {
    sales,
    loading: salesLoading,
    error: salesError,
    refresh,
  } = useSales();

  const [payments, setPayments] = useState<Payment[]>([]);
  const [overdueInstallments, setOverdueInstallments] = useState<Installment[]>(
    [],
  );

  const [closures, setClosures] = useState<ClosureDashboardItem[]>([]);

  const [loadingExtra, setLoadingExtra] = useState(true);
  const [extraError, setExtraError] = useState<string | null>(null);

  /*
   * ==========================================================
   * CARGA DE DATOS COMPLEMENTARIOS
   * ==========================================================
   *
   * Todo se obtiene desde el backend.
   *
   * - Ventas       -> useSales()
   * - Pagos        -> getPayments()
   * - Mora         -> getOverdueInstallments()
   * - Cierres      -> getClosures()
   *
   * No hay datos hardcodeados.
   */

  useEffect(() => {
    let cancelled = false;

    async function loadDashboardData() {
      try {
        setLoadingExtra(true);
        setExtraError(null);

        const [
          overdueInstallmentsResponse,
          paymentsResponse,
          closuresResponse,
        ] = await Promise.all([
          getOverdueInstallments(),
          getPayments(),
          getClosures(),
        ]);

        if (cancelled) return;

        setOverdueInstallments(overdueInstallmentsResponse ?? []);
        setPayments(paymentsResponse ?? []);
        setClosures((closuresResponse ?? []) as ClosureDashboardItem[]);
      } catch (error) {
        if (cancelled) return;

        console.error("Error cargando dashboard manager:", error);

        setExtraError(
          error instanceof Error
            ? error.message
            : "No se pudieron cargar las métricas.",
        );
      } finally {
        if (!cancelled) {
          setLoadingExtra(false);
        }
      }
    }

    void loadDashboardData();

    return () => {
      cancelled = true;
    };
  }, []);

  /*
   * ==========================================================
   * VENTAS DEL MES
   * ==========================================================
   */

  const monthlySales = useMemo(() => {
    return sales.filter((sale: Sale) => isCurrentMonth(sale.saleDate));
  }, [sales]);

  const monthlySalesAmount = useMemo(() => {
    return monthlySales.reduce(
      (total, sale) => total + Number(sale.totalAmount ?? 0),
      0,
    );
  }, [monthlySales]);

  /*
   * ==========================================================
   * COBRANZA DEL MES
   * ==========================================================
   */

  const monthlyPayments = useMemo(() => {
    return payments.filter((payment: Payment) =>
      isCurrentMonth(payment.paymentDate),
    );
  }, [payments]);

  const monthlyCollections = useMemo(() => {
    return monthlyPayments.reduce(
      (total, payment) => total + Number(payment.amount ?? 0),
      0,
    );
  }, [monthlyPayments]);

  /*
   * ==========================================================
   * MORA
   * ==========================================================
   */

  const totalOverdue = useMemo(() => {
    return overdueInstallments.reduce(
      (total, installment) => total + Number(installment.remainingAmount ?? 0),
      0,
    );
  }, [overdueInstallments]);

  /*
   * ==========================================================
   * CIERRES PENDIENTES
   * ==========================================================
   */

  const pendingClosures = useMemo(() => {
    return closures.filter((closure) => {
      const status = String(closure?.status ?? "").toUpperCase();

      return ["PENDING", "OPEN", "PENDING_VALIDATION", "SUBMITTED"].includes(
        status,
      );
    }).length;
  }, [closures]);

  /*
   * ==========================================================
   * RANKING DE VENDEDORES
   * ==========================================================
   *
   * El vendedor se obtiene directamente de:
   *
   * sale.staffId
   * sale.staff.name
   * sale.staff.surname
   * sale.totalAmount
   *
   * El backend ya está devolviendo la relación `staff`
   * porque SalesRepository utiliza:
   *
   * relations: [
   *   "client",
   *   "products",
   *   "products.product",
   *   "staff",
   *   "collector"
   * ]
   */

  const sellerRanking = useMemo<SellerRankingItem[]>(() => {
    const ranking = new globalThis.Map<string, SellerRankingItem>();

    monthlySales.forEach((sale: Sale) => {
      if (!sale.staffId) {
        return;
      }

      const current = ranking.get(sale.staffId);

      if (current) {
        current.sales += 1;
        current.amount += Number(sale.totalAmount ?? 0);

        return;
      }

      const sellerName = sale.staff
        ? `${sale.staff.name ?? ""}`.trim()
        : "Vendedor sin identificar";

      ranking.set(sale.staffId, {
        staffId: sale.staffId,
        name: sellerName,
        sales: 1,
        amount: Number(sale.totalAmount ?? 0),
      });
    });

    return Array.from(ranking.values())
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [monthlySales]);

  /*
   * ==========================================================
   * ESTADOS
   * ==========================================================
   */

  const loading = salesLoading || loadingExtra;

  const error = salesError || extraError;

  /*
   * ==========================================================
   * LOADING
   * ==========================================================
   */

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="h-56 animate-pulse rounded-3xl border border-white/10 bg-white/5" />

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-32 animate-pulse rounded-2xl border border-white/10 bg-white/5"
            />
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="h-72 animate-pulse rounded-2xl border border-white/10 bg-white/5" />
          <div className="h-72 animate-pulse rounded-2xl border border-white/10 bg-white/5" />
        </div>
      </div>
    );
  }

  /*
   * ==========================================================
   * ERROR
   * ==========================================================
   */

  if (error) {
    return (
      <div className="space-y-6">
        <section className="rounded-3xl border border-red-400/20 bg-red-500/10 p-6">
          <div className="flex items-start gap-4">
            <AlertTriangle className="mt-1 shrink-0 text-red-400" size={24} />

            <div>
              <h1 className="text-2xl font-bold text-white">
                No se pudo cargar el dashboard
              </h1>

              <p className="mt-2 text-sm text-white/60">{error}</p>

              <button
                type="button"
                onClick={() => void refresh()}
                className="mt-5 rounded-xl bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20"
              >
                Reintentar
              </button>
            </div>
          </div>
        </section>
      </div>
    );
  }

  /*
   * ==========================================================
   * DASHBOARD
   * ==========================================================
   */

  return (
    <div className="space-y-8">
      {/* HERO */}

      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-[#10254A] via-[#16315F] to-[#21457A] p-8 shadow-xl">
        <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-[#F5A300]/10 blur-3xl" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <span className="rounded-full bg-[#F5A300]/15 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-[#F5A300]">
              Dashboard del gerente
            </span>

            <h1 className="mt-4 text-4xl font-bold text-white">
              Visión general de la operación
            </h1>

            <p className="mt-3 max-w-2xl text-white/70">
              Visualizá el rendimiento financiero, comercial y operativo de la
              empresa.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                window.location.href = "/reports";
              }}
              className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-left transition hover:bg-white/10"
            >
              <BarChart3 className="mb-2 text-[#F5A300]" />

              <p className="font-semibold text-white">Reportes</p>

              <span className="text-sm text-white/60">Ver información</span>
            </button>

            <button
              type="button"
              onClick={() => {
                window.location.href = "/route-sheets";
              }}
              className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-left transition hover:bg-white/10"
            >
              <Route className="mb-2 text-emerald-400" />

              <p className="font-semibold text-white">Hojas de ruta</p>

              <span className="text-sm text-white/60">Gestionar rutas</span>
            </button>
          </div>
        </div>
      </section>

      {/* KPIs */}

      <section>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-white">
            Indicadores principales
          </h2>

          <p className="mt-1 text-sm text-white/50">
            Resumen financiero y operativo del período actual.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            title="Ventas del mes"
            value={formatCurrency(monthlySalesAmount)}
          />

          <KpiCard
            title="Cobranza del mes"
            value={formatCurrency(monthlyCollections)}
          />

          <KpiCard title="Mora total" value={formatCurrency(totalOverdue)} />

          <KpiCard title="Cierres pendientes" value={pendingClosures} />
        </div>
      </section>

      {/* RESUMEN COMERCIAL */}

      <section>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-white">
            Resumen comercial
          </h2>

          <p className="mt-1 text-sm text-white/50">
            Evolución de las operaciones del período.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <DashboardCard
            title="Ventas mensuales"
            description={`${monthlySales.length} operaciones · ${formatCurrency(
              monthlySalesAmount,
            )}`}
            icon={<TrendingUp size={22} />}
            onClick={() => {
              window.location.href = "/sales";
            }}
          />

          <DashboardCard
            title="Cobranza mensual"
            description={`${monthlyPayments.length} pagos · ${formatCurrency(
              monthlyCollections,
            )}`}
            icon={<DollarSign size={22} />}
            onClick={() => {
              window.location.href = "/payments";
            }}
          />
        </div>
      </section>

      {/* RANKING VENDEDORES */}

      <section>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-white">
              Ranking de vendedores
            </h2>

            <p className="mt-1 text-sm text-white/50">
              Ventas generadas durante el mes actual.
            </p>
          </div>

          {sellerRanking.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center">
              <Users className="mx-auto mb-3 text-white/20" size={28} />

              <p className="text-sm text-white/50">
                No hay ventas registradas este mes.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {sellerRanking.map((seller: SellerRankingItem, index: number) => (
                <div
                  key={seller.staffId}
                  className="flex items-center justify-between rounded-2xl border border-white/5 bg-black/10 p-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-sm font-bold text-white">
                      {index + 1}
                    </span>

                    <div>
                      <p className="text-sm font-medium text-white">
                        {seller.name}
                      </p>

                      <p className="text-xs text-white/40">
                        {seller.sales} {seller.sales === 1 ? "venta" : "ventas"}
                      </p>
                    </div>
                  </div>

                  <span className="text-sm font-semibold text-white">
                    {formatCurrency(seller.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* PENDIENTES */}

      <section>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-white">
            Pendientes operativos
          </h2>

          <p className="mt-1 text-sm text-white/50">
            Operaciones que requieren seguimiento.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <DashboardCard
            title="Cuotas vencidas"
            description={`${overdueInstallments.length} cuotas · ${formatCurrency(
              totalOverdue,
            )}`}
            icon={<AlertTriangle size={22} />}
            onClick={() => {
              window.location.href = "/installments";
            }}
          />

          <DashboardCard
            title="Cierres pendientes"
            description={`${pendingClosures} pendientes de aprobación`}
            icon={<Lock size={22} />}
            onClick={() => {
              window.location.href = "/closures";
            }}
          />
        </div>
      </section>

      {/* ACCIONES */}

      <section>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-white">Acciones rápidas</h2>

          <p className="mt-1 text-sm text-white/50">
            Acciones frecuentes para la gestión diaria.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <DashboardCard
            title="Aprobar ventas"
            description="Revisar operaciones pendientes"
            icon={<CheckCircle2 size={22} />}
            onClick={() => {
              window.location.href = "/sales";
            }}
          />

          <DashboardCard
            title="Generar hoja de ruta"
            description="Gestionar rutas y cobradores"
            icon={<MapIcon size={22} />}
            onClick={() => {
              window.location.href = "/route-sheets";
            }}
          />

          <DashboardCard
            title="Consultar cobranza"
            description="Consultar pagos registrados"
            icon={<DollarSign size={22} />}
            onClick={() => {
              window.location.href = "/payments";
            }}
          />

          <DashboardCard
            title="Reportes"
            description="Consultar información financiera"
            icon={<FileText size={22} />}
            onClick={() => {
              window.location.href = "/reports";
            }}
          />
        </div>
      </section>
    </div>
  );
}
