import { NotFoundException } from '@nestjs/common';
import { SalesQueryService } from './sales-query.service';
import { StaffRole } from '../../../common/enums/staff-role.enum';
import { JwtPayload } from '../../../common/interfaces/jwt-payload.interface';
import { societyScopeOf } from '../../../common/utils/society-scope.util';

/**
 * Aislamiento por sociedad en SALES (SalesQueryService): el repositorio recibe la sociedad del
 * usuario y filtra en la consulta. El fake emula ese WHERE.
 */
const OWN_SOCIETY = 'soc-a';
const OTHER_SOCIETY = 'soc-b';
const RECORD_ID = '11111111-1111-4111-8111-111111111111';
const record = { saleId: RECORD_ID, societyId: OWN_SOCIETY };

const user = (role: StaffRole, societyId: string): JwtPayload => ({
  sub: 'staff-1', email: 'x@x.com', role, societyId,
});

const fakeFindById = () =>
  jest.fn(async (id: string, societyId?: string) => {
    if (id !== RECORD_ID) return null;
    if (societyId !== undefined && societyId !== record.societyId) return null;
    return record;
  });

describe('SalesQueryService.findById — aislamiento por sociedad', () => {
  let repo: { findById: ReturnType<typeof fakeFindById> };
  let service: SalesQueryService;

  beforeEach(() => {
    repo = { findById: fakeFindById() };
    service = new SalesQueryService(repo as any, {} as any, {} as any, {} as any);
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

describe('SalesService.findById — delega el filtro de sociedad', () => {
  it('propaga la sociedad al SalesQueryService', async () => {
    const { SalesService } = await import('./sales.service');
    const queryService = { findById: jest.fn().mockResolvedValue(record) };
    const n = null as any;
    const service = new SalesService(n, n, n, n, n, queryService as any, n, n, n, n);

    await expect(service.findById(RECORD_ID, OWN_SOCIETY)).resolves.toBe(record);
    expect(queryService.findById).toHaveBeenCalledWith(RECORD_ID, OWN_SOCIETY);
  });
});
