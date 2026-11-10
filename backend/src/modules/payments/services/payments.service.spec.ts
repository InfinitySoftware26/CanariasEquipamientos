import { NotFoundException } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { StaffRole } from '../../../common/enums/staff-role.enum';
import { societyScopeOf } from '../../../common/utils/society-scope.util';

const OWN = 'soc-a';
const OTHER = 'soc-b';
const PAY_ID = '11111111-1111-4111-8111-111111111111';
const INST_OWN = '22222222-2222-4222-8222-222222222222';
const INST_OTHER = '33333333-3333-4333-8333-333333333333';

const scope = (role: StaffRole, societyId: string) =>
  societyScopeOf({ sub: 's', email: 'x', role, societyId });

function build() {
  const payment = { paymentId: PAY_ID, societyId: OWN, amount: 100 };
  const paymentsRepo = {
    findById: jest.fn(async (id: string, societyId?: string) =>
      id === PAY_ID && (societyId === undefined || societyId === OWN) ? payment : null),
  };
  const applicationsRepo = {
    findByPayment: jest.fn().mockResolvedValue(['app']),
    sumByPayment: jest.fn().mockResolvedValue(0),
    create: jest.fn().mockResolvedValue(undefined),
  };
  const installmentSociety: Record<string, string> = { [INST_OWN]: OWN, [INST_OTHER]: OTHER };
  const installmentsService = {
    findById: jest.fn(async (id: string, societyId?: string) => {
      if (!installmentSociety[id] || (societyId !== undefined && societyId !== installmentSociety[id])) {
        throw new NotFoundException();
      }
      return { installmentId: id };
    }),
    getTotalToCollect: jest.fn().mockResolvedValue({ totalToCollect: 1000 }),
    payInstallment: jest.fn().mockResolvedValue(undefined),
  };
  const service = new PaymentsService(paymentsRepo as any, applicationsRepo as any, installmentsService as any);
  return { service, applicationsRepo, installmentsService };
}

describe('PaymentsService — aislamiento por sociedad', () => {
  it('findById: propio OK, cruzado 404, SUPER_ADMIN OK', async () => {
    const { service } = build();
    await expect(service.findById(PAY_ID, scope(StaffRole.ADMIN, OWN))).resolves.toMatchObject({ paymentId: PAY_ID });
    await expect(service.findById(PAY_ID, scope(StaffRole.ADMIN, OTHER))).rejects.toBeInstanceOf(NotFoundException);
    await expect(service.findById(PAY_ID, scope(StaffRole.SUPER_ADMIN, OTHER))).resolves.toMatchObject({ paymentId: PAY_ID });
  });

  it('findApplications: cruzado 404 sin leer imputaciones', async () => {
    const { service, applicationsRepo } = build();
    await expect(service.findApplications(PAY_ID, scope(StaffRole.ADMIN, OWN))).resolves.toEqual(['app']);
    applicationsRepo.findByPayment.mockClear();
    await expect(service.findApplications(PAY_ID, scope(StaffRole.ADMIN, OTHER))).rejects.toBeInstanceOf(NotFoundException);
    expect(applicationsRepo.findByPayment).not.toHaveBeenCalled();
  });

  it('applyPayment: propio OK, cruzado 404, SUPER_ADMIN OK', async () => {
    const { service, installmentsService } = build();
    const dto = { applications: [{ installmentId: INST_OWN, amount: 10 }] } as any;
    await service.applyPayment(PAY_ID, dto, scope(StaffRole.ADMIN, OWN));
    await service.applyPayment(PAY_ID, dto, scope(StaffRole.SUPER_ADMIN, OTHER));
    await expect(service.applyPayment(PAY_ID, dto, scope(StaffRole.ADMIN, OTHER))).rejects.toBeInstanceOf(NotFoundException);
    expect(installmentsService.payInstallment).toHaveBeenCalledTimes(2);
  });

  it('applyPayment: una cuota de otra sociedad que el pago → 404 sin imputar (también para SUPER_ADMIN)', async () => {
    const { service, installmentsService, applicationsRepo } = build();
    const dto = { applications: [{ installmentId: INST_OTHER, amount: 10 }] } as any;
    await expect(service.applyPayment(PAY_ID, dto, undefined)).rejects.toBeInstanceOf(NotFoundException);
    expect(installmentsService.findById).toHaveBeenCalledWith(INST_OTHER, OWN);
    expect(installmentsService.payInstallment).not.toHaveBeenCalled();
    expect(applicationsRepo.create).not.toHaveBeenCalled();
  });
});
