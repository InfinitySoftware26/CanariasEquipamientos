import { StaffRole } from "@/types/auth.types";

export const navigationByRole = {
  [StaffRole.SUPER_ADMIN]: [
    { label: "Panel Inicial", href: "/dashboard/super-admin" },
    { label: "Sociedades", href: "/societies" },
    { label: "Staff", href: "/staff" },
    { label: "Configuración", href: "/settings" },
  ],

  [StaffRole.MANAGER]: [
    { label: "Panel Inicial", href: "/dashboard/manager" },
    { label: "Clientes", href: "/customers" },
    { label: "Cobranzas", href: "/collections" },
    { label: "Balances", href: "/balances" },
    { label: "Empleados", href: "/employees" },
  ],

  [StaffRole.ADMIN]: [
    { label: "Panel Inicial", href: "/dashboard/admin" },
    { label: "Clientes", href: "/customers" },
    { label: "Productos", href: "/products" },
    { label: "Proveedores", href: "/suppliers" },
    { label: "Reportes", href: "/reports" },
  ],

  [StaffRole.SELLER]: [
    { label: "Panel Inicial", href: "/dashboard/seller" },
    {
      label: "Clientes",
      href: "/customers",
    },
    {
      label: "Ventas",
      href: "/sales",
    },
    {
      label: "Precarga de Cliente y Venta",
      href: "/sales/preload",
    },
    {
      label: "Verificaciones",
      href: "/customers/verification",
    },
  ],

  [StaffRole.COLLECTOR]: [
    { label: "Panel Inicial", href: "/dashboard/collector" },
    { label: "Mis Cobros", href: "/collections" },
    { label: "Clientes", href: "/customers" },
    { label: "Agenda", href: "/schedule" },
  ],
};
