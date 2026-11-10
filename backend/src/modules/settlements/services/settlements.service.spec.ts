import { NotFoundException } from '@nestjs/common';
import { SettlementsService } from './settlements.service';
import { SettlementStatus } from '../../../common/enums/settlement-status.enum';
import { StaffRole } from '../../../common/enums/staff-role.enum';
import { societyScopeOf } from '../../../common/utils/society-scope.util';

const OWN = 'soc-a';
const OTHER = 'soc-b';
const ID = '11111111-1111-4111-8111-111111111111';
const CLOSURE_ID = '22222222-2222-4222-8222-222222222222';

const scope = (role: StaffRole, societyId: string) =>
  societyScopeOf({ sub: 's', email: 'x', role, societyId });

function build() {
  const settlement = { settlementId: ID, societyId: OWN, status: SettlementStatus.PENDING };
  const repo = {
    findById: jest.fn(async (id: string, societyId?: string) =>
      id === ID && (societyId === undefined || societyId === OWN) ? settlement : null),
    updateStatus: jest.fn().mockResolvedValue(undefined),
    findByClosure: jest.fn().mockResolvedValue(null),
  };
  const closureRepo = { findOne: jest.fn().mockResolvedValue(null) };
  return { repo, closureRepo, service: new SettlementsService(repo as any, closureRepo as any, {} as any, {} as any, {} as any) };
}

describe('SettlementsService — aislamiento por sociedad', () => {
  it('findById: propio OK, cruzado 404, SUPER_ADMIN OK', async () => {
    const { service } = build();
    await expect(service.findById(ID, scope(StaffRole.ADMIN, OWN))).resolves.toMatchObject({ settlementId: ID });
    await expect(service.findById(ID, scope(StaffRole.COLLECTOR, OTHER))).rejects.toBeInstanceOf(NotFoundException);
    await expect(service.findById(ID, scope(StaffRole.SUPER_ADMIN, OTHER))).resolves.toMatchObject({ settlementId: ID });
  });

  it('validate: propio OK, cruzado 404 sin escribir, SUPER_ADMIN OK', async () => {
    const { service, repo } = build();
    await service.validate(ID, { status: 'validated' } as any, scope(StaffRole.MANAGER, OWN));
    await expect(service.validate(ID, { status: 'validated' } as any, scope(StaffRole.MANAGER, OTHER))).rejects.toBeInstanceOf(NotFoundException);
    expect(repo.updateStatus).toHaveBeenCalledTimes(1);
  });

  it('create: busca el cierre filtrando por sociedad (SUPER_ADMIN sin filtro)', async () => {
    const { service, closureRepo } = build();
    await expect(service.create({ closureId: CLOSURE_ID } as any, scope(StaffRole.ADMIN, OWN))).rejects.toBeInstanceOf(NotFoundException);
    await expect(service.create({ closureId: CLOSURE_ID } as any, scope(StaffRole.SUPER_ADMIN, OTHER))).rejects.toBeInstanceOf(NotFoundException);
    expect(closureRepo.findOne.mock.calls[0][0].where).toEqual({ closureId: CLOSURE_ID, societyId: OWN });
    expect(closureRepo.findOne.mock.calls[1][0].where).toEqual({ closureId: CLOSURE_ID });
  });
});
