"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  Map,
  RefreshCw,
  Settings,
  ShieldCheck,
  Users,
  UserCog,
} from "lucide-react";

import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { useAuthStore } from "@/store/auth.store";

interface Society {
  societyId?: string;
  id?: string;
  name?: string;
  isActive?: boolean;
  active?: boolean;
}

interface Staff {
  staffId?: string;
  id?: string;
  name?: string;
  role?: string;
  isActive?: boolean;
  active?: boolean;
}

interface Zone {
  zoneId?: string;
  id?: string;
  name?: string;
  isActive?: boolean;
  active?: boolean;
}

interface SuperAdminStats {
  activeSocieties: number;
  activeUsers: number;
  administrators: number;
  sellers: number;
  collectors: number;
  activeZones: number;
  totalSocieties: number;
  totalUsers: number;
  totalZones: number;
}

const EMPTY_STATS: SuperAdminStats = {
  activeSocieties: 0,
  activeUsers: 0,
  administrators: 0,
  sellers: 0,
  collectors: 0,
  activeZones: 0,
  totalSocieties: 0,
  totalUsers: 0,
  totalZones: 0,
};

function isActive(value?: boolean) {
  if (typeof value === "boolean") {
    return value;
  }

  return true;
}

function normalizeArray<T>(data: unknown): T[] {
  if (Array.isArray(data)) {
    return data as T[];
  }

  if (
    data &&
    typeof data === "object" &&
    "data" in data &&
    Array.isArray((data as { data?: unknown }).data)
  ) {
    return (data as { data: T[] }).data;
  }

  if (
    data &&
    typeof data === "object" &&
    "items" in data &&
    Array.isArray((data as { items?: unknown }).items)
  ) {
    return (data as { items: T[] }).items;
  }

  return [];
}

interface SafeFetchResult<T> {
  data: T | null;
  status: number | null;
  ok: boolean;
}

async function safeFetch<T>(
  endpoint: string,
  accessToken: string | null,
): Promise<SafeFetchResult<T>> {
  try {
    if (!accessToken) {
      console.warn(
        `SuperAdminDashboard: no hay accessToken para consultar ${endpoint}`,
      );

      return {
        data: null,
        status: 401,
        ok: false,
      };
    }

    const response = await fetch(endpoint, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      console.warn(
        `SuperAdminDashboard: ${endpoint} respondió HTTP ${response.status}`,
      );

      return {
        data: null,
        status: response.status,
        ok: false,
      };
    }

    const contentType = response.headers.get("content-type") ?? "";

    if (!contentType.includes("application/json")) {
      console.warn(`SuperAdminDashboard: ${endpoint} no devolvió JSON`);

      return {
        data: null,
        status: response.status,
        ok: false,
      };
    }

    const data = (await response.json()) as T;

    return {
      data,
      status: response.status,
      ok: true,
    };
  } catch (error) {
    console.error(`SuperAdminDashboard: error consultando ${endpoint}`, error);

    return {
      data: null,
      status: null,
      ok: false,
    };
  }
}

export default function SuperAdminDashboard() {
  const router = useRouter();

  const accessToken = useAuthStore((state) => state.accessToken);

  const [stats, setStats] = useState<SuperAdminStats>(EMPTY_STATS);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  /*
   * No mostramos los errores técnicos de los endpoints
   * al usuario.
   *
   * Solamente usamos este estado para saber si alguna
   * métrica no pudo calcularse.
   */
  const [hasDataIssues, setHasDataIssues] = useState(false);

  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";

  const loadDashboard = useCallback(async () => {
    if (!accessToken) {
      setLoading(false);
      setHasDataIssues(true);
      return;
    }

    try {
      setHasDataIssues(false);

      const [societiesResult, staffResult, zonesResult] = await Promise.all([
        safeFetch<unknown>(`${apiUrl}/societies`, accessToken),

        safeFetch<unknown>(`${apiUrl}/staff`, accessToken),

        safeFetch<unknown>(`${apiUrl}/zones`, accessToken),
      ]);

      /*
       * =========================================================
       * NORMALIZACIÓN
       * =========================================================
       */

      const societies = normalizeArray<Society>(societiesResult.data);

      const staff = normalizeArray<Staff>(staffResult.data);

      const zones = normalizeArray<Zone>(zonesResult.data);

      /*
       * =========================================================
       * SOCIEDADES
       * =========================================================
       */

      const activeSocieties = societies.filter((society) =>
        isActive(society.isActive ?? society.active),
      ).length;

      /*
       * =========================================================
       * USUARIOS
       * =========================================================
       */

      const activeUsers = staff.filter((member) =>
        isActive(member.isActive ?? member.active),
      ).length;

      /*
       * =========================================================
       * ROLES
       * =========================================================
       */

      const normalizeRole = (role?: string) =>
        String(role ?? "")
          .trim()
          .toUpperCase();

      const administrators = staff.filter((member) => {
        const role = normalizeRole(member.role);

        return role === "ADMIN" || role === "MANAGER";
      }).length;

      const sellers = staff.filter((member) => {
        return normalizeRole(member.role) === "SELLER";
      }).length;

      const collectors = staff.filter((member) => {
        return normalizeRole(member.role) === "COLLECTOR";
      }).length;

      /*
       * =========================================================
       * ZONAS
       * =========================================================
       */

      const activeZones = zones.filter((zone) =>
        isActive(zone.isActive ?? zone.active),
      ).length;

      /*
       * =========================================================
       * GUARDAMOS LAS MÉTRICAS
       * =========================================================
       */

      setStats({
        activeSocieties,
        activeUsers,
        administrators,
        sellers,
        collectors,
        activeZones,

        totalSocieties: societies.length,
        totalUsers: staff.length,
        totalZones: zones.length,
      });

      /*
       * Si algún endpoint falló, no rompemos el dashboard.
       *
       * Tampoco mostramos "HTTP 401" al usuario.
       */

      setHasDataIssues(
        !societiesResult.ok || !staffResult.ok || !zonesResult.ok,
      );
    } catch (error) {
      console.error("Error cargando SuperAdminDashboard:", error);

      setHasDataIssues(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [accessToken, apiUrl]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const handleRefresh = () => {
    setRefreshing(true);
    void loadDashboard();
  };

  const hasSystemAlerts = useMemo(() => {
    return hasDataIssues;
  }, [hasDataIssues]);

  /*
   * ============================================================
   * LOADING
   * ============================================================
   */

  if (loading) {
    return (
      <div className="space-y-8">
        <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-[#10254A] via-[#16315F] to-[#21457A] p-8 shadow-xl">
          <div className="animate-pulse space-y-5">
            <div className="h-6 w-40 rounded-full bg-white/10" />

            <div className="h-10 w-2/3 rounded-xl bg-white/10" />

            <div className="h-5 w-1/2 rounded-xl bg-white/10" />
          </div>
        </section>

        <section>
          <div className="mb-4">
            <div className="h-6 w-48 animate-pulse rounded bg-white/10" />
          </div>

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-32 animate-pulse rounded-2xl border border-white/10 bg-white/5"
              />
            ))}
          </div>
        </section>

        <section>
          <div className="mb-4">
            <div className="h-6 w-48 animate-pulse rounded bg-white/10" />
          </div>

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-32 animate-pulse rounded-2xl border border-white/10 bg-white/5"
              />
            ))}
          </div>
        </section>
      </div>
    );
  }

  /*
   * ============================================================
   * DASHBOARD
   * ============================================================
   */

  return (
    <div className="space-y-8">
      {/* HERO */}

      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-[#10254A] via-[#16315F] to-[#21457A] p-8 shadow-xl">
        <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-[#F5A300]/10 blur-3xl" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <span className="rounded-full bg-[#F5A300]/15 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-[#F5A300]">
              Super administrador
            </span>

            <h1 className="mt-4 text-4xl font-bold text-white">
              Administración del sistema
            </h1>

            <p className="mt-3 max-w-2xl text-white/70">
              Gestioná sociedades, usuarios, roles, zonas y la configuración
              general de Canarias.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => router.push("/societies")}
              className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-left transition hover:bg-white/10"
            >
              <Building2 className="mb-2 text-[#F5A300]" />

              <p className="font-semibold text-white">Sociedades</p>

              <span className="text-sm text-white/60">
                Gestionar sociedades
              </span>
            </button>

            <button
              type="button"
              onClick={() => router.push("/staff")}
              className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-left transition hover:bg-white/10"
            >
              <Users className="mb-2 text-emerald-400" />

              <p className="font-semibold text-white">Usuarios</p>

              <span className="text-sm text-white/60">Gestionar usuarios</span>
            </button>
          </div>
        </div>
      </section>

      {/* ESTADO DE DATOS */}

      {hasSystemAlerts && (
        <section className="rounded-3xl border border-amber-500/20 bg-amber-500/10 p-5">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-amber-400" size={22} />

            <div>
              <p className="font-medium text-amber-300">
                Información parcialmente disponible
              </p>

              <p className="mt-1 text-sm text-amber-200/60">
                Algunas métricas no pudieron actualizarse. Los datos disponibles
                continúan visibles.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* KPIs */}

      <section>
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Estado general</h2>

            <p className="mt-1 text-sm text-white/50">
              Datos reales de la estructura del sistema.
            </p>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
            Actualizar
          </button>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard title="Sociedades activas" value={stats.activeSocieties} />

          <KpiCard title="Usuarios activos" value={stats.activeUsers} />

          <KpiCard title="Administradores" value={stats.administrators} />

          <KpiCard title="Zonas activas" value={stats.activeZones} />
        </div>
      </section>

      {/* USUARIOS POR ROL */}

      <section>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-white">Usuarios por rol</h2>

          <p className="mt-1 text-sm text-white/50">
            Distribución real de usuarios según su función.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          <KpiCard title="Vendedores" value={stats.sellers} />

          <KpiCard title="Cobradores" value={stats.collectors} />

          <KpiCard title="Administradores" value={stats.administrators} />
        </div>
      </section>

      {/* ESTRUCTURA */}

      <section>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-white">
            Estructura del sistema
          </h2>

          <p className="mt-1 text-sm text-white/50">
            Cantidad total de registros disponibles.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <DashboardCard
            title="Sociedades"
            description={`${stats.totalSocieties} sociedades registradas · ${stats.activeSocieties} activas`}
            icon={<Building2 size={22} />}
            onClick={() => router.push("/societies")}
          />

          <DashboardCard
            title="Usuarios"
            description={`${stats.totalUsers} usuarios registrados · ${stats.activeUsers} activos`}
            icon={<Users size={22} />}
            onClick={() => router.push("/staff")}
          />

          <DashboardCard
            title="Zonas"
            description={`${stats.totalZones} zonas registradas · ${stats.activeZones} activas`}
            icon={<Map size={22} />}
            onClick={() => router.push("/zones")}
          />
        </div>
      </section>

      {/* GESTIÓN */}

      <section>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-white">
            Gestión del sistema
          </h2>

          <p className="mt-1 text-sm text-white/50">
            Administración de la estructura principal de Canarias.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <DashboardCard
            title="Sociedades"
            description="Crear y administrar sociedades"
            icon={<Building2 size={22} />}
            onClick={() => router.push("/select-society")}
          />

          <DashboardCard
            title="Usuarios"
            description="Administrar usuarios del sistema"
            icon={<Users size={22} />}
            onClick={() => router.push("/staff")}
          />

          <DashboardCard
            title="Roles"
            description="Gestionar permisos y roles"
            icon={<ShieldCheck size={22} />}
            onClick={() => router.push("/staff")}
          />

          <DashboardCard
            title="Zonas"
            description="Administrar zonas operativas"
            icon={<Map size={22} />}
            onClick={() => router.push("/zones")}
          />
        </div>
      </section>

      {/* ACCIONES RÁPIDAS */}

      <section>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-white">Acciones rápidas</h2>

          <p className="mt-1 text-sm text-white/50">
            Acciones administrativas frecuentes.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <DashboardCard
            title="Gestionar usuarios"
            description="Alta, baja y modificación"
            icon={<UserCog size={22} />}
            onClick={() => router.push("/staff")}
          />

          <DashboardCard
            title="Gestionar zonas"
            description="Configurar zonas operativas"
            icon={<Map size={22} />}
            onClick={() => router.push("/zones")}
          />

          <DashboardCard
            title="Configuración"
            description="Configuración general"
            icon={<Settings size={22} />}
            onClick={() => router.push("/settings")}
          />
        </div>
      </section>

      {/* ESTADO */}

      <section>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-white">
            Estado del sistema
          </h2>

          <p className="mt-1 text-sm text-white/50">
            Estado de las métricas administrativas.
          </p>
        </div>

        {hasSystemAlerts ? (
          <div className="rounded-3xl border border-amber-500/20 bg-amber-500/10 p-5">
            <div className="flex items-center gap-3">
              <AlertTriangle className="text-amber-400" size={22} />

              <div>
                <p className="font-medium text-amber-300">
                  Información parcialmente disponible
                </p>

                <p className="mt-1 text-sm text-amber-200/60">
                  Algunas métricas no pudieron ser consultadas. Podés actualizar
                  nuevamente.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-5">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="text-emerald-400" size={22} />

              <div>
                <p className="font-medium text-emerald-300">
                  Sistema operativo
                </p>

                <p className="mt-1 text-sm text-emerald-200/60">
                  Las métricas administrativas fueron cargadas correctamente.
                </p>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
