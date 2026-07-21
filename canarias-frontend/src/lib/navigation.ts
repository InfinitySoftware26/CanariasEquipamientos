import { StaffRole } from "@/types/auth.types";

export const navigationByRole = {
  [StaffRole.SUPER_ADMIN]: [
    { label: "Panel Inicial", href: "/dashboard/super-admin" },
    { label: "Ventas", href: "/sales" },
    { label: "Hojas de Ruta", href: "/route-sheets" },
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
    { label: "Zonas", href: "/zones" },
    { label: "Cobranzas", href: "/collections" },
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
    {
      label: "Productos",
      href: "/products",
    },
    {
      label: "Hojas de Ruta",
      href: "/route-sheets",
    },
    {
      label: "Zonas",
      href: "/zones",
    },
    {
      label: "Proveedores",
      href: "/suppliers",
    },
    {
      label: "Empleados",
      href: "/staff",
    },
    {
      label: "Reportes",
      href: "/reports",
    },
  ],

  [StaffRole.SELLER]: [
    {
      label: "Panel Inicial",
      href: "/dashboard/seller",
    },
    {
      label: "Mis Comisiones",
      href: "/dashboard/seller/commissions",
    },
    {
      label: "Nueva Venta",
      href: "/sales/preload",
    },
    {
      label: "Mis Ventas",
      href: "/sales/my",
    },
    {
      label: "Clientes",
      href: "/client",
    },
  ],

  [StaffRole.COLLECTOR]: [
    {
      label: "Panel Inicial",
      href: "/dashboard/collector",
    },
    { label: "Mis Ventas", href: "/sales/collector" },
    {
      label: "Mis Hojas de Ruta",
      href: "/route-sheets",
    },
    {
      label: "Zonas",
      href: "/zones",
    },
    {
      label: "Mis Cobros",
      href: "/collections",
    },
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
