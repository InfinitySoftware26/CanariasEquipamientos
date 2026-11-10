import { NotFoundException } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CashboxService } from '../../cashbox/services/cashbox.service';
import { CashboxStatus } from '../../../common/enums/cashbox-status.enum';
import { StaffRole } from '../../../common/enums/staff-role.enum';
import { JwtPayload } from '../../../common/interfaces/jwt-payload.interface';

const OWN_SOCIETY = 'soc-a';
const OTHER_SOCIETY = 'soc-b';
const CASHBOX_ID = '11111111-1111-4111-8111-111111111111';

const user = (role: StaffRole, societyId: string): JwtPayload => ({
  sub: 'staff-1', email: 'x@x.com', role, societyId,
});

function build() {
  const cashbox = {
    cashboxId: CASHBOX_ID, societyId: OWN_SOCIETY, status: CashboxStatus.OPEN,
    openingDate: new Date('2026-11-01'), openingBalance: 0, closingBalance: null,
  };
  const cashboxRepo = {
    findById: jest.fn(async (id: string, societyId?: string) => {
      if (id !== CASHBOX_ID) return null;
      if (societyId !== undefined && societyId !== cashbox.societyId) return null;
      return cashbox;
    }),
  };
  const cashboxService = new CashboxService(cashboxRepo as any, { find: jest.fn().mockResolvedValue([]) } as any);
  const n = null as any;
  const service = new ReportsService(n, n, n, n, cashboxService, n, n, n);
  return { service, cashboxRepo };
}

describe('ReportsService.cashboxClosurePdf — aislamiento por sociedad', () => {
  it('caja propia → genera PDF', async () => {
    const { service, cashboxRepo } = build();
    const pdf = await service.cashboxClosurePdf(CASHBOX_ID, user(StaffRole.ADMIN, OWN_SOCIETY));
    expect(Buffer.isBuffer(pdf)).toBe(true);
    expect(cashboxRepo.findById).toHaveBeenCalledWith(CASHBOX_ID, OWN_SOCIETY);
  });

  it('caja de otra sociedad → 404', async () => {
    const { service } = build();
    await expect(service.cashboxClosurePdf(CASHBOX_ID, user(StaffRole.MANAGER, OTHER_SOCIETY)))
      .rejects.toBeInstanceOf(NotFoundException);
  });

  it('SUPER_ADMIN de otra sociedad → genera PDF', async () => {
    const { service, cashboxRepo } = build();
    await expect(service.cashboxClosurePdf(CASHBOX_ID, user(StaffRole.SUPER_ADMIN, OTHER_SOCIETY)))
      .resolves.toBeDefined();
    expect(cashboxRepo.findById).toHaveBeenCalledWith(CASHBOX_ID, undefined);
  });
});

describe('ReportsService.receiptPdf — aislamiento por sociedad (Bloque 0b)', () => {
  const RECEIPT_ID = '22222222-2222-4222-8222-222222222222';
  const build = () => {
    const receiptsService = { generatePdf: jest.fn(async (id: string, societyId?: string) => {
      if (id !== RECEIPT_ID || (societyId !== undefined && societyId !== OWN_SOCIETY)) {
        throw new NotFoundException();
      }
      return Buffer.from('pdf');
    }) };
    const n = null as any;
    return { receiptsService, service: new ReportsService(n, n, n, n, n, n, n, receiptsService as any) };
  };

  it('propio → PDF', async () => {
    const { service, receiptsService } = build();
    await expect(service.receiptPdf(RECEIPT_ID, user(StaffRole.ADMIN, OWN_SOCIETY))).resolves.toBeInstanceOf(Buffer);
    expect(receiptsService.generatePdf).toHaveBeenCalledWith(RECEIPT_ID, OWN_SOCIETY);
  });

  it('otra sociedad → 404', async () => {
    const { service } = build();
    await expect(service.receiptPdf(RECEIPT_ID, user(StaffRole.ADMIN, OTHER_SOCIETY))).rejects.toBeInstanceOf(NotFoundException);
  });

  it('SUPER_ADMIN → PDF sin filtro', async () => {
    const { service, receiptsService } = build();
    await expect(service.receiptPdf(RECEIPT_ID, user(StaffRole.SUPER_ADMIN, OTHER_SOCIETY))).resolves.toBeInstanceOf(Buffer);
    expect(receiptsService.generatePdf).toHaveBeenCalledWith(RECEIPT_ID, undefined);
  });
});
