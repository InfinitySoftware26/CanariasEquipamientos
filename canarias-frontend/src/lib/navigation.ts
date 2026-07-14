import { StaffRole } from "@/types/auth.types";

export const navigationByRole = {
  [StaffRole.SUPER_ADMIN]: [
    {
      label: "Panel Inicial",
      href: "/dashboard/super-admin",
    },

    {
      label: "Ventas",
      href: "/sales",
    },

    {
      label: "Clientes",
      href: "/client",
    },
    {
      label: "Zonas",
      href: "/zones",
    },
    {
      label: "Hojas de Ruta",
      href: "/route-sheets",
    },

    {
      label: "Liquidaciones",
      href: "/settlements",
    },

    {
      label: "Financiación",
      href: "/financing",
    },

    {
      label: "Sociedades",
      href: "/societies",
    },

    {
      label: "Staff",
      href: "/staff",
    },

    {
      label: "Configuración",
      href: "/settings",
    },
  ],

  [StaffRole.MANAGER]: [
    {
      label: "Panel Inicial",
      href: "/dashboard/manager",
    },

    {
      label: "Ventas",
      href: "/sales",
    },

    {
      label: "Clientes",
      href: "/client",
    },
    {
      label: "Zonas",
      href: "/zones",
    },
    {
      label: "Hojas de Ruta",
      href: "/route-sheets",
    },

    {
      label: "Liquidaciones",
      href: "/settlements",
    },

    {
      label: "Financiación",
      href: "/financing",
    },

    {
      label: "Balances",
      href: "/balances",
    },

    {
      label: "Empleados",
      href: "/employees",
    },
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
      label: "Zonas",
      href: "/zones",
    },
    {
      label: "Hojas de Ruta",
      href: "/route-sheets",
    },

    {
      label: "Liquidaciones",
      href: "/settlements",
    },

    {
      label: "Financiación",
      href: "/financing",
    },

    {
      label: "Productos",
      href: "/products",
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

    {
      label: "Mis Hojas de Ruta",
      href: "/route-sheets",
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
