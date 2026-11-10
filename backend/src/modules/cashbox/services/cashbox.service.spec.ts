import { NotFoundException } from '@nestjs/common';
import { CashboxService } from './cashbox.service';
import { StaffRole } from '../../../common/enums/staff-role.enum';
import { JwtPayload } from '../../../common/interfaces/jwt-payload.interface';
import { societyScopeOf } from '../../../common/utils/society-scope.util';

/**
 * Aislamiento por sociedad en CASHBOX: el repositorio recibe la sociedad del
 * usuario y filtra en la consulta. El fake emula ese WHERE.
 */
const OWN_SOCIETY = 'soc-a';
const OTHER_SOCIETY = 'soc-b';
const RECORD_ID = '11111111-1111-4111-8111-111111111111';
const record = { cashboxId: RECORD_ID, societyId: OWN_SOCIETY };

const user = (role: StaffRole, societyId: string): JwtPayload => ({
  sub: 'staff-1', email: 'x@x.com', role, societyId,
});

const fakeFindById = () =>
  jest.fn(async (id: string, societyId?: string) => {
    if (id !== RECORD_ID) return null;
    if (societyId !== undefined && societyId !== record.societyId) return null;
    return record;
  });

describe('CashboxService.findById — aislamiento por sociedad', () => {
  let repo: { findById: ReturnType<typeof fakeFindById> };
  let service: CashboxService;

  beforeEach(() => {
    repo = { findById: fakeFindById() };
    service = new CashboxService(repo as any, {} as any);
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

describe('CashboxService.getBalance — aislamiento por sociedad', () => {
  it('caja propia → OK', async () => {
    const movementsRepo = { find: jest.fn().mockResolvedValue([]) };
    const service = new CashboxService({ findById: fakeFindById() } as any, movementsRepo as any);
    await expect(service.getBalance(RECORD_ID, OWN_SOCIETY)).resolves.toBeDefined();
  });

  it('caja de otra sociedad → 404 sin leer movimientos', async () => {
    const movementsRepo = { find: jest.fn().mockResolvedValue([]) };
    const service = new CashboxService({ findById: fakeFindById() } as any, movementsRepo as any);
    await expect(service.getBalance(RECORD_ID, OTHER_SOCIETY)).rejects.toBeInstanceOf(NotFoundException);
    expect(movementsRepo.find).not.toHaveBeenCalled();
  });
});

describe('CashboxService.close — aislamiento por sociedad (Bloque 0b)', () => {
  const build = () => {
    const open = { ...record, status: 'open' };
    const repo = {
      findById: jest.fn(async (id: string, societyId?: string) =>
        id === RECORD_ID && (societyId === undefined || societyId === OWN_SOCIETY) ? open : null),
      updateStatus: jest.fn().mockResolvedValue(undefined),
    };
    return { repo, service: new CashboxService(repo as any, {} as any) };
  };

  it('propia → cierra', async () => {
    const { repo, service } = build();
    await service.close(RECORD_ID, { closingBalance: 10 } as any, societyScopeOf(user(StaffRole.ADMIN, OWN_SOCIETY)));
    expect(repo.updateStatus).toHaveBeenCalled();
  });

  it('otra sociedad → 404 sin cerrar', async () => {
    const { repo, service } = build();
    await expect(service.close(RECORD_ID, { closingBalance: 10 } as any, societyScopeOf(user(StaffRole.ADMIN, OTHER_SOCIETY))))
      .rejects.toBeInstanceOf(NotFoundException);
    expect(repo.updateStatus).not.toHaveBeenCalled();
  });

  it('SUPER_ADMIN → cierra', async () => {
    const { repo, service } = build();
    await service.close(RECORD_ID, { closingBalance: 10 } as any, societyScopeOf(user(StaffRole.SUPER_ADMIN, OTHER_SOCIETY)));
    expect(repo.updateStatus).toHaveBeenCalled();
  });
});
