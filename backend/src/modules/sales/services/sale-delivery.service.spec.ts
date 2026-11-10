import { NotFoundException } from '@nestjs/common';
import { SaleDeliveryService } from './sale-delivery.service';
import { SalesQueryService } from './sales-query.service';
import { SaleStatus } from '../../../common/enums/sale-status.enum';
import { StaffRole } from '../../../common/enums/staff-role.enum';
import { JwtPayload } from '../../../common/interfaces/jwt-payload.interface';
import { ScheduleDeliveryDto } from '../dto/schedule-delivery.dto';

const OWN_SOCIETY = 'soc-a';
const OTHER_SOCIETY = 'soc-b';
const SALE_ID = '11111111-1111-4111-8111-111111111111';

const user = (role: StaffRole, societyId: string): JwtPayload => ({
  sub: 'staff-1', email: 'x@x.com', role, societyId,
});

const autoMock = () =>
  new Proxy({} as Record<string, jest.Mock>, {
    get: (t, k: string) => (t[k] ??= jest.fn().mockResolvedValue(undefined)),
  });

function build() {
  const sale = { saleId: SALE_ID, societyId: OWN_SOCIETY, status: SaleStatus.PENDING_DELIVERY };
  const salesRepo = autoMock();
  salesRepo.findById = jest.fn(async (id: string, societyId?: string) => {
    if (id !== SALE_ID) return null;
    if (societyId !== undefined && societyId !== sale.societyId) return null;
    return sale;
  });
  const queryService = new SalesQueryService(salesRepo as any, {} as any, {} as any, {} as any);
  const scheduleService = autoMock();
  const service = new SaleDeliveryService(
    salesRepo as any, autoMock() as any, autoMock() as any, queryService, scheduleService as any,
  );
  return { service, salesRepo };
}

const dto = { deliveryDate: '2026-11-20' } as ScheduleDeliveryDto;

describe('SaleDeliveryService — aislamiento por sociedad', () => {
  it('scheduleDelivery propia sociedad → OK', async () => {
    const { service, salesRepo } = build();
    await service.scheduleDelivery(SALE_ID, dto, user(StaffRole.ADMIN, OWN_SOCIETY));
    expect(salesRepo.findById).toHaveBeenCalledWith(SALE_ID, OWN_SOCIETY);
    expect(salesRepo.update).toHaveBeenCalledWith(SALE_ID, { deliveryDate: dto.deliveryDate });
  });

  it('scheduleDelivery SUPER_ADMIN de otra sociedad → OK', async () => {
    const { service, salesRepo } = build();
    await service.scheduleDelivery(SALE_ID, dto, user(StaffRole.SUPER_ADMIN, OTHER_SOCIETY));
    expect(salesRepo.findById).toHaveBeenCalledWith(SALE_ID, undefined);
    expect(salesRepo.update).toHaveBeenCalled();
  });

  const cross = user(StaffRole.COLLECTOR, OTHER_SOCIETY);
  it.each([
    ['deliver', (s: SaleDeliveryService) => s.deliver(SALE_ID, cross)],
    ['failDelivery', (s: SaleDeliveryService) => s.failDelivery(SALE_ID, {} as any, cross)],
    ['scheduleDelivery', (s: SaleDeliveryService) => s.scheduleDelivery(SALE_ID, dto, cross)],
  ])('%s de otra sociedad → 404 sin escribir', async (_n, call) => {
    const { service, salesRepo } = build();
    await expect(call(service)).rejects.toBeInstanceOf(NotFoundException);
    expect(salesRepo.update).not.toHaveBeenCalled();
    expect(salesRepo.updateStatus).not.toHaveBeenCalled();
  });
});
