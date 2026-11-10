import { instanceToPlain } from 'class-transformer';
import { toSaleResponse } from './sale-response.mapper';
import { Sale } from '../entities/sale.entity';
import { SaleProduct } from '../entities/sale-product.entity';
import { Product } from '../../products/entities/product.entity';
import { Staff } from '../../staff/entities/staff.entity';
import { StaffRole } from '../../../common/enums/staff-role.enum';

function buildSale(): Sale {
  const product = Object.assign(new Product(), { productId: 'p1', price: 1000, costPrice: 600 });
  const sp = Object.assign(new SaleProduct(), { saleProductId: 'sp1', product, quantity: 1 });
  const staff = Object.assign(new Staff(), { staffId: 's1', passwordHash: 'secret' });
  return Object.assign(new Sale(), { saleId: 'v1', products: [sp], staff });
}

describe('toSaleResponse', () => {
  it.each([StaffRole.SELLER, StaffRole.COLLECTOR])('%s → products[].product sin costPrice', (role) => {
    const res = toSaleResponse(buildSale(), role);
    expect(res.products[0].product).not.toHaveProperty('costPrice');
    expect(res.products[0].product).toMatchObject({ productId: 'p1', price: 1000 });
  });

  it.each([StaffRole.ADMIN, StaffRole.MANAGER, StaffRole.SUPER_ADMIN])('%s → conserva costPrice', (role) => {
    expect(toSaleResponse(buildSale(), role).products[0].product).toHaveProperty('costPrice', 600);
  });

  it('no muta la entidad original', () => {
    const sale = buildSale();
    toSaleResponse(sale, StaffRole.SELLER);
    expect(sale.products[0].product.costPrice).toBe(600);
  });

  it('conserva el prototipo: @Exclude sigue ocultando passwordHash', () => {
    const plain = instanceToPlain(toSaleResponse(buildSale(), StaffRole.SELLER)) as any;
    expect(plain.staff).not.toHaveProperty('passwordHash');
    expect(plain.products[0].product).not.toHaveProperty('costPrice');
  });

  it('venta sin products cargados → sin cambios', () => {
    const sale = Object.assign(new Sale(), { saleId: 'v1' });
    expect(toSaleResponse(sale, StaffRole.SELLER)).toBe(sale);
  });
});
