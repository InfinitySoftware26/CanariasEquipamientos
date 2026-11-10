import { BadRequestException, NotFoundException } from '@nestjs/common';
import { SaleWorkflowService } from './sale-workflow.service';
import { SalesQueryService } from './sales-query.service';
import { StaffService } from '../../staff/services/staff.service';
import { StaffRole } from '../../../common/enums/staff-role.enum';
import { JwtPayload } from '../../../common/interfaces/jwt-payload.interface';

const SOC_A = 'soc-a';
const SOC_B = 'soc-b';
const SALE_ID = '11111111-1111-4111-8111-111111111111';

/** Empleados: sociedad primaria y asignaciones activas (criterio de pertenencia). */
const staff: Record<string, { staffId: string; role: StaffRole; isActive: boolean; primary: string; assigned: string[] }> = {
  colA: { staffId: 'colA', role: StaffRole.COLLECTOR, isActive: true, primary: SOC_A, assigned: [] },
  colBAssignedA: { staffId: 'colBAssignedA', role: StaffRole.COLLECTOR, isActive: true, primary: SOC_B, assigned: [SOC_A] },
  colB: { staffId: 'colB', role: StaffRole.COLLECTOR, isActive: true, primary: SOC_B, assigned: [] },
  sellerA: { staffId: 'sellerA', role: StaffRole.SELLER, isActive: true, primary: SOC_A, assigned: [] },
  inactiveColA: { staffId: 'inactiveColA', role: StaffRole.COLLECTOR, isActive: false, primary: SOC_A, assigned: [] },
};

const user = (role: StaffRole, societyId: string): JwtPayload => ({ sub: 'adm', email: 'x', role, societyId });

const autoMock = () =>
  new Proxy({} as Record<string, jest.Mock>, {
    get: (t, k: string) => (t[k] ??= jest.fn().mockResolvedValue(undefined)),
  });

function build() {
  const sale = { saleId: SALE_ID, societyId: SOC_A, assignedCollectorId: null };
  const salesRepo = autoMock();
  salesRepo.findById = jest.fn(async (id: string, societyId?: string) =>
    id === SALE_ID && (societyId === undefined || societyId === SOC_A) ? sale : null);
  const staffRepo = {
    findById: jest.fn(async (id: string, societyId?: string) => {
      const s = staff[id];
      if (!s) return null;
      if (societyId !== undefined && s.primary !== societyId && !s.assigned.includes(societyId)) return null;
      return s;
    }),
  };
  const staffService = new StaffService(staffRepo as any, {} as any);
  const queryService = new SalesQueryService(salesRepo as any, {} as any, {} as any, {} as any);
  const service = new SaleWorkflowService(
    salesRepo as any, autoMock() as any, autoMock() as any, autoMock() as any, queryService, autoMock() as any, staffService,
  );
  return { service, salesRepo, staffRepo };
}

describe('SaleWorkflowService.assignCollector — validación del cobrador', () => {
  it.each([
    ['cobrador con sociedad primaria = venta', 'colA'],
    ['cobrador con asignación activa en la sociedad de la venta', 'colBAssignedA'],
  ])('%s → OK', async (_d, collectorId) => {
    const { service, salesRepo } = build();
    await service.assignCollector(SALE_ID, collectorId, user(StaffRole.ADMIN, SOC_A));
    expect(salesRepo.update).toHaveBeenCalledWith(SALE_ID, { assignedCollectorId: collectorId });
  });

  it.each([
    ['inexistente', 'nope', NotFoundException],
    ['de otra sociedad', 'colB', NotFoundException],
    ['sin rol COLLECTOR', 'sellerA', BadRequestException],
    ['inactivo', 'inactiveColA', BadRequestException],
  ] as const)('cobrador %s → error sin escribir', async (_d, collectorId, error) => {
    const { service, salesRepo } = build();
    await expect(service.assignCollector(SALE_ID, collectorId, user(StaffRole.ADMIN, SOC_A))).rejects.toBeInstanceOf(error);
    expect(salesRepo.update).not.toHaveBeenCalled();
  });

  it('SUPER_ADMIN de otra sociedad: valida contra la sociedad de la venta', async () => {
    const { service, staffRepo } = build();
    await service.assignCollector(SALE_ID, 'colA', user(StaffRole.SUPER_ADMIN, SOC_B));
    expect(staffRepo.findById).toHaveBeenCalledWith('colA', SOC_A);
    await expect(service.assignCollector(SALE_ID, 'colB', user(StaffRole.SUPER_ADMIN, SOC_B))).rejects.toBeInstanceOf(NotFoundException);
  });

  it('venta de otra sociedad → 404 antes de validar el cobrador', async () => {
    const { service, staffRepo } = build();
    await expect(service.assignCollector(SALE_ID, 'colA', user(StaffRole.ADMIN, SOC_B))).rejects.toBeInstanceOf(NotFoundException);
    expect(staffRepo.findById).not.toHaveBeenCalled();
  });
});
