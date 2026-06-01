/**
 * Roles asignables via endpoint general POST /staff.
 * No incluye SUPER_ADMIN — ese rol tiene su propio endpoint.
 */
export enum AssignableRole {
  MANAGER   = 'gerente',
  ADMIN     = 'administrativo',
  SELLER    = 'vendedor',
  COLLECTOR = 'cobrador',
}
