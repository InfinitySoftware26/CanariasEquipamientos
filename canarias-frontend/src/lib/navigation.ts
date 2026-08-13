import { StaffRole } from "@/types/auth.types";

export const navigationByRole = {
  [StaffRole.SUPER_ADMIN]: [
    { label: "Panel Inicial", href: "/dashboard/super-admin" },
    { label: "Ventas", href: "/sales" },
    { label: "Hojas de Ruta", href: "/route-sheets" },
    { label: "Cobranzas", href: "/collections" },
    { label: "Cuotas", href: "/installments" },
    { label: "Visitas fallidas", href: "/failed-visits" },
    { label: "Cierres", href: "/closures" },
    { label: "Liquidaciones", href: "/settlements" },
    { label: "Financiación", href: "/financing" },
    { label: "Reportes", href: "/reports" },
    { label: "Zonas", href: "/zones" },
    { label: "Sociedades", href: "/societies" },
    { label: "Empleados", href: "/staff" },
    { label: "Configuración", href: "/settings" },
  ],

  [StaffRole.MANAGER]: [
    { label: "Panel Inicial", href: "/dashboard/manager" },
    { label: "Ventas", href: "/sales" },
    { label: "Clientes", href: "/client" },
    { label: "Hojas de Ruta", href: "/route-sheets" },
    { label: "Cobranzas", href: "/collections" },
    { label: "Cuotas", href: "/installments" },
    { label: "Cierres", href: "/closures" },
    { label: "Liquidaciones", href: "/settlements" },
    { label: "Financiación", href: "/financing" },
    { label: "Reportes", href: "/reports" },
    { label: "Zonas", href: "/zones" },
    { label: "Balances", href: "/balances" },
    { label: "Empleados", href: "/staff" },
  ],

  [StaffRole.ADMIN]: [
    {
      label: "Panel Inicial",
      href: "/dashboard/admin",
    },
    {
      label: "Ventas",
      href: "/sales",
    },
    {
      label: "Nueva Venta",
      href: "/sales/preload",
    },
    {
      label: "Clientes",
      href: "/client",
    },
    { label: "Cobros", href: "/payments" },
    { label: "Cobranzas", href: "/collections" },
    { label: "Cuotas", href: "/installments" },
    { label: "Visitas fallidas", href: "/failed-visits" },
    { label: "Cierres", href: "/closures" },
    { label: "Liquidaciones", href: "/settlements" },
    { label: "Financiación", href: "/financing" },
    { label: "Reportes", href: "/reports" },
    {
      label: "Hojas de Ruta",
      href: "/route-sheets",
    },
    {
      label: "Zonas",
      href: "/zones",
    },

    {
      label: "Empleados",
      href: "/staff",
    },
  ],

  [StaffRole.SELLER]: [
    {label: "Panel Inicial",href: "/dashboard/seller"},
    {label: "Mis Comisiones",href: "/dashboard/seller/commissions"},
    {label: "Nueva Venta",href: "/sales/preload"},
    {label: "Mis Ventas",href: "/sales/my"},
    {label: "Clientes",href: "/client"},
  ],

  [StaffRole.COLLECTOR]: [
    {label: "Panel Inicial",href: "/dashboard/collector"},
    { label: "Mis Ventas", href: "/sales/collector" },
    {
      label: "Mis Hojas de Ruta",
      href: "/route-sheets/collector",
    },
    {
      label: "Zonas",
      href: "/zones",
    },
    {
      label: "Mis Cobros",
      href: "/collections",
    },
    { label: "Visitas fallidas", href: "/failed-visits" },
    { label: "Cierres", href: "/closures" },
    {
      label: "Liquidaciones",
      href: "/settlements",
    },
    {
      label: "Clientes",
      href: "/client",
    },
  ],
};
