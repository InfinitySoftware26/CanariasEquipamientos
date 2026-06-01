import { StaffRole } from "@/types/auth.types";

export const navigationByRole = {
  [StaffRole.SUPER_ADMIN]: [
    { label: "Dashboard", href: "/dashboard/super-admin" },
    { label: "Sociedades", href: "/sociedades" },
    { label: "Usuarios", href: "/usuarios" },
    { label: "Configuración", href: "/configuracion" },
  ],

  [StaffRole.MANAGER]: [
    { label: "Dashboard", href: "/dashboard/manager" },
    { label: "Clientes", href: "/clientes" },
    { label: "Cobranzas", href: "/cobranzas" },
    { label: "Balances", href: "/balances" },
    { label: "Empleados", href: "/empleados" },
  ],

  [StaffRole.ADMIN]: [
    { label: "Dashboard", href: "/dashboard/admin" },
    { label: "Clientes", href: "/clientes" },
    { label: "Productos", href: "/productos" },
    { label: "Proveedores", href: "/proveedores" },
    { label: "Reportes", href: "/reportes" },
  ],

  [StaffRole.SELLER]: [
    { label: "Dashboard", href: "/dashboard/seller" },
    { label: "Clientes", href: "/clientes" },
    { label: "Ventas", href: "/ventas" },
  ],

  [StaffRole.COLLECTOR]: [
    { label: "Dashboard", href: "/dashboard/collector" },
    { label: "Mis Cobros", href: "/mis-cobros" },
    { label: "Clientes", href: "/clientes" },
    { label: "Agenda", href: "/agenda" },
  ],
};
