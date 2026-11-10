import { NotFoundException } from '@nestjs/common';
import { RouteSheetQueryService } from './route-sheet-query.service';
import { RouteSheetManagementService } from './route-sheet-management.service';
import { RouteSheetInstallmentService } from './route-sheet-installment.service';
import { RouteSheetItemsService } from './route-sheet-items.service';
import { RouteSheetsRepository } from '../repositories/route-sheets.repository';
import { RouteSheetStatus } from '../../../common/enums/route-sheet-status.enum';
import { RouteSheetItemResult } from '../../../common/enums/route-sheet-item-result.enum';
import { StaffRole } from '../../../common/enums/staff-role.enum';
import { JwtPayload } from '../../../common/interfaces/jwt-payload.interface';

const OWN = 'soc-a';
const OTHER = 'soc-b';
const SHEET_ID = '11111111-1111-4111-8111-111111111111';
const ITEM_ID = '22222222-2222-4222-8222-222222222222';
const INST_ID = '33333333-3333-4333-8333-333333333333';

const user = (role: StaffRole, societyId: string): JwtPayload => ({
  sub: 'staff-1', email: 'x@x.com', role, societyId,
});
const own = user(StaffRole.ADMIN, OWN);
const cross = user(StaffRole.ADMIN, OTHER);
const superAdmin = user(StaffRole.SUPER_ADMIN, OTHER);

const autoMock = (overrides: Record<string, unknown> = {}) =>
  new Proxy({ ...overrides } as Record<string, any>, {
    get: (t, k: string) => (t[k] ??= jest.fn().mockResolvedValue(undefined)),
  });

function sheetsRepo(status = RouteSheetStatus.PENDING) {
  const sheet = { routeSheetId: SHEET_ID, societyId: OWN, staffId: 'col-1', zoneId: 'z1', status, routeDate: '2026-11-10' };
  return autoMock({
    findById: jest.fn(async (id: string, societyId?: string) =>
      id === SHEET_ID && (societyId === undefined || societyId === sheet.societyId) ? sheet : null),
  });
}

describe('RouteSheetsRepository.findById', () => {
  it('con sociedad la incluye en el WHERE; sin sociedad, solo por ID', async () => {
    const orm = { findOne: jest.fn().mockResolvedValue(null) };
    const repo = new RouteSheetsRepository(orm as any);
    await repo.findById(SHEET_ID, OWN);
    await repo.findById(SHEET_ID);
    expect(orm.findOne.mock.calls[0][0].where).toEqual({ routeSheetId: SHEET_ID, societyId: OWN });
    expect(orm.findOne.mock.calls[1][0].where).toEqual({ routeSheetId: SHEET_ID });
  });
});

describe('RouteSheetQueryService.findByIdWithItems', () => {
  const build = () => {
    const items = autoMock({ findByRouteSheet: jest.fn().mockResolvedValue([]) });
    const repoFind = autoMock({ findOne: jest.fn().mockResolvedValue(null) });
    return new RouteSheetQueryService(sheetsRepo() as any, items as any, repoFind as any, repoFind as any, repoFind as any, repoFind as any, autoMock() as any);
  };

  it('propio → OK', async () => {
    await expect(build().findByIdWithItems(SHEET_ID, own)).resolves.toBeDefined();
  });
  it('cruzado → 404 (antes 403)', async () => {
    await expect(build().findByIdWithItems(SHEET_ID, cross)).rejects.toBeInstanceOf(NotFoundException);
  });
  it('SUPER_ADMIN → OK (antes 403)', async () => {
    await expect(build().findByIdWithItems(SHEET_ID, superAdmin)).resolves.toBeDefined();
  });
});

describe('RouteSheetManagementService.updateStatus', () => {
  const build = () => {
    const repo = sheetsRepo();
    const query = new RouteSheetQueryService(repo as any, autoMock() as any, autoMock() as any, autoMock() as any, autoMock() as any, autoMock() as any, autoMock() as any);
    return { repo, service: new RouteSheetManagementService(repo as any, autoMock() as any, query, autoMock() as any, autoMock() as any) };
  };

  it('propio → OK', async () => {
    const { repo, service } = build();
    await service.updateStatus(SHEET_ID, RouteSheetStatus.IN_PROGRESS, own);
    expect(repo.updateStatus).toHaveBeenCalledWith(SHEET_ID, RouteSheetStatus.IN_PROGRESS);
  });
  it('cruzado → 404 sin escribir', async () => {
    const { repo, service } = build();
    await expect(service.updateStatus(SHEET_ID, RouteSheetStatus.IN_PROGRESS, cross)).rejects.toBeInstanceOf(NotFoundException);
    expect(repo.updateStatus).not.toHaveBeenCalled();
  });
  it('SUPER_ADMIN → OK', async () => {
    const { repo, service } = build();
    await service.updateStatus(SHEET_ID, RouteSheetStatus.IN_PROGRESS, superAdmin);
    expect(repo.updateStatus).toHaveBeenCalled();
  });
});

describe('RouteSheetInstallmentService', () => {
  const build = (installmentSociety = OWN) => {
    const repo = sheetsRepo();
    const query = new RouteSheetQueryService(repo as any, autoMock() as any, autoMock() as any, autoMock() as any, autoMock() as any, autoMock() as any, autoMock() as any);
    const installmentRepo = autoMock({
      find: jest.fn().mockResolvedValue([]),
      findOne: jest.fn().mockResolvedValue({ installmentId: INST_ID, societyId: installmentSociety, isRefinanced: true }),
    });
    const service = new RouteSheetInstallmentService(autoMock() as any, installmentRepo as any, autoMock() as any, autoMock() as any, query, autoMock() as any);
    return { service, installmentRepo };
  };

  it('getAvailableInstallments: propio OK, cruzado 404, SUPER_ADMIN OK con la sociedad de la hoja', async () => {
    const { service, installmentRepo } = build();
    await expect(service.getAvailableInstallmentsForRouteSheet(SHEET_ID, own)).resolves.toEqual([]);
    await expect(service.getAvailableInstallmentsForRouteSheet(SHEET_ID, cross)).rejects.toBeInstanceOf(NotFoundException);
    await expect(service.getAvailableInstallmentsForRouteSheet(SHEET_ID, superAdmin)).resolves.toEqual([]);
    expect(installmentRepo.find.mock.calls[1][0].where.societyId).toBe(OWN);
  });

  it('addInstallmentManually: cuota de otra sociedad que la hoja → 404', async () => {
    const { service } = build(OTHER);
    await expect(service.addInstallmentManually(SHEET_ID, INST_ID, superAdmin)).rejects.toBeInstanceOf(NotFoundException);
  });
});

describe('RouteSheetItemsService', () => {
  const build = () => {
    const items = autoMock({
      findById: jest.fn(async (id: string) => (id === ITEM_ID ? { itemId: ITEM_ID, routeSheetId: SHEET_ID, result: RouteSheetItemResult.PENDING } : null)),
      findByRouteSheet: jest.fn().mockResolvedValue(['item']),
    });
    const repo = sheetsRepo();
    return { items, service: new RouteSheetItemsService(items as any, repo as any, autoMock() as any, autoMock() as any, autoMock() as any) };
  };

  it('removePendingItem: propio OK, cruzado 404 sin borrar, SUPER_ADMIN OK', async () => {
    const ok = build();
    await ok.service.removePendingItem(ITEM_ID, own);
    const sa = build();
    await sa.service.removePendingItem(ITEM_ID, superAdmin);
    const x = build();
    await expect(x.service.removePendingItem(ITEM_ID, cross)).rejects.toThrow(`Ítem de hoja de ruta ${ITEM_ID} no encontrado`);
    const writes = (m: Record<string, jest.Mock>) => Object.keys(m).filter((k) => !['findById', 'findByRouteSheet'].includes(k) && m[k].mock.calls.length > 0);
    expect(writes(x.items)).toEqual([]);
    expect(writes(ok.items).length).toBeGreaterThan(0);
  });

  it('updateResult de otra sociedad → 404', async () => {
    const { service } = build();
    await expect(service.updateResult(ITEM_ID, { result: RouteSheetItemResult.PENDING } as any, cross)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('GET ?routeSheetId: propio OK, cruzado 404, SUPER_ADMIN OK', async () => {
    const { service } = build();
    await expect(service.findByRouteSheet(SHEET_ID, OWN)).resolves.toEqual(['item']);
    await expect(service.findByRouteSheet(SHEET_ID, OTHER)).rejects.toBeInstanceOf(NotFoundException);
    await expect(service.findByRouteSheet(SHEET_ID, undefined)).resolves.toEqual(['item']);
  });
});
