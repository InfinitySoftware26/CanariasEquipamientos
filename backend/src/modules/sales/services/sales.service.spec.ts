import { NotFoundException } from '@nestjs/common';
import { SalesService } from './sales.service';
import { SalesQueryService } from './sales-query.service';
import { StaffRole } from '../../../common/enums/staff-role.enum';
import { JwtPayload } from '../../../common/interfaces/jwt-payload.interface';
import { societyScopeOf } from '../../../common/utils/society-scope.util';

const OWN_SOCIETY = 'soc-a';
const OTHER_SOCIETY = 'soc-b';
const SALE_ID = '11111111-1111-4111-8111-111111111111';

const user = (role: StaffRole, societyId: string): JwtPayload => ({
  sub: 'staff-1', email: 'x@x.com', role, societyId,
});

function build() {
  const sale = { saleId: SALE_ID, societyId: OWN_SOCIETY };
  const salesRepo = {
    findById: jest.fn(async (id: string, societyId?: string) => {
      if (id !== SALE_ID) return null;
      if (societyId !== undefined && societyId !== sale.societyId) return null;
      return sale;
    }),
    update: jest.fn().mockResolvedValue(undefined),
  };
  const validationsRepo = { findBySale: jest.fn().mockResolvedValue(['v']) };
  const attemptsRepo = { findBySale: jest.fn().mockResolvedValue(['a']) };
  const historyRepo = { findBySale: jest.fn().mockResolvedValue(['h']) };
  const queryService = new SalesQueryService(
    salesRepo as any, validationsRepo as any, attemptsRepo as any, historyRepo as any,
  );
  const n = null as any;
  const service = new SalesService(salesRepo as any, n, n, n, n, queryService, n, n, n, n);
  return { service, salesRepo, validationsRepo, attemptsRepo, historyRepo };
}

describe('SalesService — detalle y observación, aislamiento por sociedad', () => {
  const own = societyScopeOf(user(StaffRole.ADMIN, OWN_SOCIETY));
  const cross = societyScopeOf(user(StaffRole.ADMIN, OTHER_SOCIETY));
  const superAdmin = societyScopeOf(user(StaffRole.SUPER_ADMIN, OTHER_SOCIETY));

  it.each([
    ['findHistory', 'historyRepo', ['h']],
    ['findValidations', 'validationsRepo', ['v']],
    ['findDeliveryAttempts', 'attemptsRepo', ['a']],
  ] as const)('%s: propio OK, cruzado 404, SUPER_ADMIN OK', async (method, repoKey, expected) => {
    const ctx = build();
    await expect(ctx.service[method](SALE_ID, own)).resolves.toEqual(expected);
    await expect(ctx.service[method](SALE_ID, superAdmin)).resolves.toEqual(expected);

    ctx[repoKey].findBySale.mockClear();
    await expect(ctx.service[method](SALE_ID, cross)).rejects.toBeInstanceOf(NotFoundException);
    expect(ctx[repoKey].findBySale).not.toHaveBeenCalled();
  });

  it('updateObservation: propio OK, cruzado 404 sin escribir, SUPER_ADMIN OK', async () => {
    const ctx = build();
    await ctx.service.updateObservation(SALE_ID, 'nota', own);
    await ctx.service.updateObservation(SALE_ID, 'nota', superAdmin);
    expect(ctx.salesRepo.update).toHaveBeenCalledTimes(2);

    await expect(ctx.service.updateObservation(SALE_ID, 'nota', cross)).rejects.toBeInstanceOf(NotFoundException);
    expect(ctx.salesRepo.update).toHaveBeenCalledTimes(2);
  });

  it('configureCollectionSchedule de otra sociedad → 404', async () => {
    const ctx = build();
    await expect(
      ctx.service.configureCollectionSchedule(SALE_ID, {} as any, user(StaffRole.ADMIN, OTHER_SOCIETY)),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(ctx.salesRepo.findById).toHaveBeenCalledWith(SALE_ID, OTHER_SOCIETY);
  });
});
