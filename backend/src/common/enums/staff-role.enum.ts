/**
 * Jerarquía de roles:
 * SUPER_ADMIN → MANAGER → ADMIN → SELLER / COLLECTOR
 */
export enum StaffRole {
  SUPER_ADMIN = 'super_admin',    // Duenos del sistema — acceso global
  MANAGER     = 'gerente',        // Gerente de sociedad
  ADMIN       = 'administrativo', // Administrativo
  SELLER      = 'vendedor',       // Vendedor
  COLLECTOR   = 'cobrador',       // Cobrador
}
