import { NotFoundException } from '@nestjs/common';
import { SaleWorkflowService } from './sale-workflow.service';
import { SalesQueryService } from './sales-query.service';
import { SaleStatus } from '../../../common/enums/sale-status.enum';
import { StaffRole } from '../../../common/enums/staff-role.enum';
import { JwtPayload } from '../../../common/interfaces/jwt-payload.interface';
import { ValidateSaleDto } from '../dto/validate-sale.dto';

const OWN_SOCIETY = 'soc-a';
const OTHER_SOCIETY = 'soc-b';
const SALE_ID = '11111111-1111-4111-8111-111111111111';

const user = (role: StaffRole, societyId: string): JwtPayload => ({
  sub: 'staff-1', email: 'x@x.com', role, societyId,
});

/** Mock que crea un jest.fn() resuelto para cualquier método pedido. */
const autoMock = () =>
  new Proxy({} as Record<string, jest.Mock>, {
    get: (t, k: string) => (t[k] ??= jest.fn().mockResolvedValue(undefined)),
  });

function build(status = SaleStatus.PENDING_ADMIN_VALIDATION) {
  const sale = { saleId: SALE_ID, societyId: OWN_SOCIETY, status };
  const salesRepo = autoMock();
  salesRepo.findById = jest.fn(async (id: string, societyId?: string) => {
    if (id !== SALE_ID) return null;
    if (societyId !== undefined && societyId !== sale.societyId) return null;
    return sale;
  });
  const queryService = new SalesQueryService(salesRepo as any, {} as any, {} as any, {} as any);
  const service = new SaleWorkflowService(
    salesRepo as any, autoMock() as any, autoMock() as any, autoMock() as any,
    queryService, autoMock() as any, autoMock() as any,
  );
  return { service, salesRepo };
}

const reject = { status: 'rejected', observation: 'x' } as unknown as ValidateSaleDto;

describe('SaleWorkflowService — aislamiento por sociedad', () => {
  it('adminValidate propia sociedad → OK', async () => {
    const { service, salesRepo } = build();
    await service.adminValidate(SALE_ID, reject, user(StaffRole.ADMIN, OWN_SOCIETY));
    expect(salesRepo.findById).toHaveBeenCalledWith(SALE_ID, OWN_SOCIETY);
    expect(salesRepo.updateStatus).toHaveBeenCalledWith(SALE_ID, SaleStatus.REJECTED_ADMIN);
  });

  it('adminValidate SUPER_ADMIN de otra sociedad → OK', async () => {
    const { service, salesRepo } = build();
    await service.adminValidate(SALE_ID, reject, user(StaffRole.SUPER_ADMIN, OTHER_SOCIETY));
    expect(salesRepo.findById).toHaveBeenCalledWith(SALE_ID, undefined);
    expect(salesRepo.updateStatus).toHaveBeenCalled();
  });

  const cross = user(StaffRole.ADMIN, OTHER_SOCIETY);
  it.each([
    ['adminValidate', (s: SaleWorkflowService) => s.adminValidate(SALE_ID, reject, cross)],
    ['envValidate', (s: SaleWorkflowService) => s.envValidate(SALE_ID, reject, cross)],
    ['close', (s: SaleWorkflowService) => s.close(SALE_ID, {} as any, cross)],
    ['assignCollector', (s: SaleWorkflowService) => s.assignCollector(SALE_ID, 'col-1', cross)],
    ['markCollectorDocumentsDelivered', (s: SaleWorkflowService) => s.markCollectorDocumentsDelivered(SALE_ID, {} as any, cross)],
  ])('%s de otra sociedad → 404 sin escribir', async (_n, call) => {
    const { service, salesRepo } = build();
    await expect(call(service)).rejects.toBeInstanceOf(NotFoundException);
    expect(salesRepo.update).not.toHaveBeenCalled();
    expect(salesRepo.updateStatus).not.toHaveBeenCalled();
  });
});
