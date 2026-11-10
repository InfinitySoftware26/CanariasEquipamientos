import { Sale } from '../entities/sale.entity';
import { SaleProduct } from '../entities/sale-product.entity';
import { StaffRole } from '../../../common/enums/staff-role.enum';
import { toProductResponse } from '../../products/mappers/product-response.mapper';

/** Copia superficial que conserva el prototipo (y con él los @Exclude de class-transformer). */
function cloneWith<T extends object>(source: T, overrides: Partial<Record<keyof T, unknown>>): T {
  return Object.assign(Object.create(Object.getPrototypeOf(source)), source, overrides) as T;
}

/**
 * Adapta la venta a la respuesta según el rol: aplica toProductResponse a
 * cada products[].product, de modo que SELLER y COLLECTOR no reciben
 * costPrice. No muta la entidad original.
 */
export function toSaleResponse(sale: Sale, role: StaffRole): Sale {
  if (!Array.isArray(sale.products)) return sale;
  const products = sale.products.map((sp: SaleProduct) =>
    sp.product ? cloneWith(sp, { product: toProductResponse(sp.product, role) }) : sp,
  );
  return cloneWith(sale, { products });
}
