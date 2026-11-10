import { Product } from '../entities/product.entity';
import { StaffRole } from '../../../common/enums/staff-role.enum';

/** Roles que no deben ver el precio de costo del producto. */
const ROLES_WITHOUT_COST_PRICE: ReadonlySet<StaffRole> = new Set([
  StaffRole.SELLER,
  StaffRole.COLLECTOR,
]);

export type ProductResponse = Product | Omit<Product, 'costPrice'>;

/**
 * Adapta el producto a la respuesta según el rol: SELLER y COLLECTOR no
 * reciben costPrice (la propiedad se omite, no se envía en null).
 */
export function toProductResponse(product: Product, role: StaffRole): ProductResponse {
  if (!ROLES_WITHOUT_COST_PRICE.has(role)) return product;
  const { costPrice: _omitted, ...rest } = product;
  return rest;
}
