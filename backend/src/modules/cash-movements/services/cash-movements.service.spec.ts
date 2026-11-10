import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CashMovementsService } from './cash-movements.service';
import { CashboxService } from '../../cashbox/services/cashbox.service';
import { CashboxStatus } from '../../../common/enums/cashbox-status.enum';
import { CashMovementType } from '../../../common/enums/cash-movement-type.enum';
import { StaffRole } from '../../../common/enums/staff-role.enum';
import { JwtPayload } from '../../../common/interfaces/jwt-payload.interface';
import { CreateCashMovementDto } from '../dto/create-cash-movement.dto';

const OWN_SOCIETY = 'soc-a';
const OTHER_SOCIETY = 'soc-b';
const CASHBOX_ID = '11111111-1111-4111-8111-111111111111';

const user = (role: StaffRole, societyId: string): JwtPayload => ({
  sub: 'staff-1', email: 'x@x.com', role, societyId,
});

const dto = {
  cashboxId: CASHBOX_ID,
  type: CashMovementType.INCOME,
  amount: 100,
  concept: 'test',
} as CreateCashMovementDto;

function build(status: CashboxStatus) {
  const cashbox = { cashboxId: CASHBOX_ID, societyId: OWN_SOCIETY, status };
  const cashboxRepo = {
    findById: jest.fn(async (id: string, societyId?: string) => {
      if (id !== CASHBOX_ID) return null;
      if (societyId !== undefined && societyId !== cashbox.societyId) return null;
      return cashbox;
    }),
  };
  const cashboxService = new CashboxService(cashboxRepo as any, {} as any);
  const movementsRepo = { create: jest.fn(async (data: unknown) => data) };
  const service = new CashMovementsService(movementsRepo as any, cashboxService);
  return { service, movementsRepo, cashboxRepo };
}

describe('CashMovementsService.create — sociedad y caja abierta', () => {
  it('caja propia y abierta → registra el movimiento en la sociedad de la caja', async () => {
    const { service, movementsRepo, cashboxRepo } = build(CashboxStatus.OPEN);
    await service.create(dto, user(StaffRole.ADMIN, OWN_SOCIETY));
    expect(cashboxRepo.findById).toHaveBeenCalledWith(CASHBOX_ID, OWN_SOCIETY);
    expect(movementsRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ cashboxId: CASHBOX_ID, societyId: OWN_SOCIETY, staffId: 'staff-1' }),
    );
  });

  it('caja de otra sociedad → 404 y no registra nada', async () => {
    const { service, movementsRepo } = build(CashboxStatus.OPEN);
    await expect(service.create(dto, user(StaffRole.ADMIN, OTHER_SOCIETY))).rejects.toBeInstanceOf(NotFoundException);
    expect(movementsRepo.create).not.toHaveBeenCalled();
  });

  it('SUPER_ADMIN de otra sociedad → OK, el movimiento queda en la sociedad de la caja', async () => {
    const { service, movementsRepo, cashboxRepo } = build(CashboxStatus.OPEN);
    await service.create(dto, user(StaffRole.SUPER_ADMIN, OTHER_SOCIETY));
    expect(cashboxRepo.findById).toHaveBeenCalledWith(CASHBOX_ID, undefined);
    expect(movementsRepo.create).toHaveBeenCalledWith(expect.objectContaining({ societyId: OWN_SOCIETY }));
  });

  it('caja cerrada → 400 y no registra nada', async () => {
    const { service, movementsRepo } = build(CashboxStatus.CLOSED);
    await expect(service.create(dto, user(StaffRole.ADMIN, OWN_SOCIETY))).rejects.toBeInstanceOf(BadRequestException);
    expect(movementsRepo.create).not.toHaveBeenCalled();
  });
});
