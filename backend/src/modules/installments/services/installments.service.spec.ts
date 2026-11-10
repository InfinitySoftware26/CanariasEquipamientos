import { NotFoundException } from '@nestjs/common';
import { InstallmentsService } from './installments.service';
import { InstallmentStatus } from '../../../common/enums/installment-status.enum';
import { StaffRole } from '../../../common/enums/staff-role.enum';
import { societyScopeOf } from '../../../common/utils/society-scope.util';

const OWN = 'soc-a';
const OTHER = 'soc-b';
const ID = '11111111-1111-4111-8111-111111111111';

const scope = (role: StaffRole, societyId: string) =>
  societyScopeOf({ sub: 's', email: 'x', role, societyId });

function build() {
  const installment = {
    installmentId: ID, societyId: OWN, status: InstallmentStatus.PENDING, isRefinanced: false,
    amount: 100, paidAmount: 0, remainingAmount: 100, lateInterestAmount: 0, dueDate: '2099-01-01',
  };
  const repo = new Proxy(
    {
      findById: jest.fn(async (id: string, societyId?: string) =>
        id === ID && (societyId === undefined || societyId === OWN) ? { ...installment } : null),
    } as Record<string, jest.Mock>,
    { get: (t, k: string) => (t[k] ??= jest.fn().mockResolvedValue(undefined)) },
  );
  return { repo, service: new InstallmentsService(repo as any, {} as any, {} as any) };
}

const cases = [
  ['payInstallment', (s: InstallmentsService, soc?: string) => s.payInstallment(ID, 10, soc)],
  ['updateDueDate', (s: InstallmentsService, soc?: string) => s.updateDueDate(ID, '2099-02-01', soc)],
  ['updateLateInterest', (s: InstallmentsService, soc?: string) => s.updateLateInterest(ID, { dailyLateInterestRate: 0.001 } as any, soc)],
] as const;

describe('InstallmentsService — aislamiento por sociedad', () => {
  it.each(cases)('%s: cruzado → 404 sin escribir', async (_n, call) => {
    const { service, repo } = build();
    await expect(call(service, scope(StaffRole.COLLECTOR, OTHER))).rejects.toBeInstanceOf(NotFoundException);
    expect(repo.findById).toHaveBeenCalledWith(ID, OTHER);
    expect(repo.update).not.toHaveBeenCalled();
  });

  it.each(cases)('%s: propio → busca con la sociedad y pasa el control de acceso', async (_n, call) => {
    const { service, repo } = build();
    await call(service, scope(StaffRole.ADMIN, OWN)).catch((e: unknown) => {
      expect(e).not.toBeInstanceOf(NotFoundException);
    });
    expect(repo.findById).toHaveBeenNthCalledWith(1, ID, OWN);
  });

  it.each(cases)('%s: SUPER_ADMIN → busca sin filtro', async (_n, call) => {
    const { service, repo } = build();
    await call(service, scope(StaffRole.SUPER_ADMIN, OTHER)).catch((e: unknown) => {
      expect(e).not.toBeInstanceOf(NotFoundException);
    });
    expect(repo.findById).toHaveBeenNthCalledWith(1, ID, undefined);
  });

  it('payInstallment propio → actualiza la cuota', async () => {
    const { service, repo } = build();
    await service.payInstallment(ID, 10, OWN);
    expect(repo.update).toHaveBeenCalled();
  });
});
