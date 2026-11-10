import { NotFoundException } from '@nestjs/common';
import { ProductsService } from './products.service';
import { StaffRole } from '../../../common/enums/staff-role.enum';
import { JwtPayload } from '../../../common/interfaces/jwt-payload.interface';
import { societyScopeOf } from '../../../common/utils/society-scope.util';

/**
 * Aislamiento por sociedad en PRODUCTS: el repositorio recibe la sociedad del
 * usuario y filtra en la consulta. El fake emula ese WHERE.
 */
const OWN_SOCIETY = 'soc-a';
const OTHER_SOCIETY = 'soc-b';
const RECORD_ID = '11111111-1111-4111-8111-111111111111';
const record = { productId: RECORD_ID, societyId: OWN_SOCIETY };

const user = (role: StaffRole, societyId: string): JwtPayload => ({
  sub: 'staff-1', email: 'x@x.com', role, societyId,
});

const fakeFindById = () =>
  jest.fn(async (id: string, societyId?: string) => {
    if (id !== RECORD_ID) return null;
    if (societyId !== undefined && societyId !== record.societyId) return null;
    return record;
  });

describe('ProductsService.findById — aislamiento por sociedad', () => {
  let repo: { findById: ReturnType<typeof fakeFindById> };
  let service: ProductsService;

  beforeEach(() => {
    repo = { findById: fakeFindById() };
    service = new ProductsService(repo as any);
  });

  it('acceso a registro de la propia sociedad → OK', async () => {
    const u = user(StaffRole.ADMIN, OWN_SOCIETY);
    await expect(service.findById(RECORD_ID, societyScopeOf(u))).resolves.toBe(record);
    expect(repo.findById).toHaveBeenCalledWith(RECORD_ID, OWN_SOCIETY);
  });

  it('acceso cruzado a otra sociedad → 404', async () => {
    const u = user(StaffRole.ADMIN, OTHER_SOCIETY);
    await expect(service.findById(RECORD_ID, societyScopeOf(u))).rejects.toBeInstanceOf(NotFoundException);
    expect(repo.findById).toHaveBeenCalledWith(RECORD_ID, OTHER_SOCIETY);
  });

  it('SUPER_ADMIN de otra sociedad → OK (sin filtro)', async () => {
    const u = user(StaffRole.SUPER_ADMIN, OTHER_SOCIETY);
    await expect(service.findById(RECORD_ID, societyScopeOf(u))).resolves.toBe(record);
    expect(repo.findById).toHaveBeenCalledWith(RECORD_ID, undefined);
  });

  it('registro inexistente → 404', async () => {
    await expect(service.findById('22222222-2222-4222-8222-222222222222', OWN_SOCIETY)).rejects.toBeInstanceOf(NotFoundException);
  });
});

describe('ProductsService.update / deactivate — aislamiento por sociedad (Bloque 0b)', () => {
  const build = () => {
    const repo = {
      findById: fakeFindById(),
      update: jest.fn().mockResolvedValue(record),
      softDelete: jest.fn().mockResolvedValue(undefined),
    };
    return { repo, service: new ProductsService(repo as any) };
  };
  const own = () => societyScopeOf(user(StaffRole.ADMIN, OWN_SOCIETY));
  const cross = () => societyScopeOf(user(StaffRole.ADMIN, OTHER_SOCIETY));
  const sa = () => societyScopeOf(user(StaffRole.SUPER_ADMIN, OTHER_SOCIETY));

  it('update: propio OK, SUPER_ADMIN OK, cruzado 404 sin escribir', async () => {
    const { repo, service } = build();
    await service.update(RECORD_ID, { name: 'x' } as any, own());
    await service.update(RECORD_ID, { name: 'x' } as any, sa());
    expect(repo.update).toHaveBeenCalledTimes(2);
    await expect(service.update(RECORD_ID, { name: 'x' } as any, cross())).rejects.toBeInstanceOf(NotFoundException);
    expect(repo.update).toHaveBeenCalledTimes(2);
  });

  it('deactivate: propio OK, SUPER_ADMIN OK, cruzado 404 sin escribir', async () => {
    const { repo, service } = build();
    await service.deactivate(RECORD_ID, own());
    await service.deactivate(RECORD_ID, sa());
    expect(repo.softDelete).toHaveBeenCalledTimes(2);
    await expect(service.deactivate(RECORD_ID, cross())).rejects.toBeInstanceOf(NotFoundException);
    expect(repo.softDelete).toHaveBeenCalledTimes(2);
  });
});
