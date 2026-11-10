import { toProductResponse } from './product-response.mapper';
import { Product } from '../entities/product.entity';
import { StaffRole } from '../../../common/enums/staff-role.enum';

const product = Object.assign(new Product(), {
  productId: '11111111-1111-4111-8111-111111111111',
  name: 'Heladera',
  price: 1000,
  costPrice: 600,
  societyId: 'soc-a',
});

describe('toProductResponse', () => {
  it.each([StaffRole.SELLER, StaffRole.COLLECTOR])('%s → sin costPrice', (role) => {
    const res = toProductResponse(product, role);
    expect(res).not.toHaveProperty('costPrice');
    expect(res).toMatchObject({ productId: product.productId, price: 1000 });
  });

  it.each([StaffRole.ADMIN, StaffRole.MANAGER, StaffRole.SUPER_ADMIN])('%s → con costPrice', (role) => {
    expect(toProductResponse(product, role)).toHaveProperty('costPrice', 600);
  });

  it('no muta la entidad original', () => {
    toProductResponse(product, StaffRole.SELLER);
    expect(product.costPrice).toBe(600);
  });
});
