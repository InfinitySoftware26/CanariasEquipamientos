import { StaffRole } from "@/types/auth.types";

export const navigationByRole = {
  [StaffRole.SUPER_ADMIN]: [
    { label: "Dashboard", href: "/dashboard/super-admin" },
    { label: "Sociedades", href: "/societies" },
    { label: "Staff", href: "/staff" },
    { label: "Configuración", href: "/settings" },
  ],

  [StaffRole.MANAGER]: [
    { label: "Dashboard", href: "/dashboard/manager" },
    { label: "Clientes", href: "/customers" },
    { label: "Cobranzas", href: "/collections" },
    { label: "Balances", href: "/balances" },
    { label: "Empleados", href: "/employees" },
  ],

  [StaffRole.ADMIN]: [
    { label: "Dashboard", href: "/dashboard/admin" },
    { label: "Clientes", href: "/customers" },
    { label: "Productos", href: "/products" },
    { label: "Proveedores", href: "/suppliers" },
    { label: "Reportes", href: "/reports" },
  ],

  [StaffRole.SELLER]: [
    { label: "Dashboard", href: "/dashboard/seller" },
    { label: "Clientes", href: "/customers" },
    { label: "Ventas", href: "/sales" },
  ],

  [StaffRole.COLLECTOR]: [
    { label: "Dashboard", href: "/dashboard/collector" },
    { label: "Mis Cobros", href: "/collections" },
    { label: "Clientes", href: "/customers" },
    { label: "Agenda", href: "/schedule" },
  ],
};
