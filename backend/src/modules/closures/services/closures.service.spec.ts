import { ConflictException } from '@nestjs/common';
import { Not } from 'typeorm';
import { ClosuresService } from './closures.service';
import { ClosuresRepository } from '../repositories/closures.repository';
import { DailyClosureStatus } from '../../../common/enums/daily-closure-status.enum';
import { StaffRole } from '../../../common/enums/staff-role.enum';
import { JwtPayload } from '../../../common/interfaces/jwt-payload.interface';

const collector: JwtPayload = { sub: 'col-1', email: 'c@x.com', role: StaffRole.COLLECTOR, societyId: 'soc-a' };
const dto = { closingDate: '2026-11-10', totalCollected: 100 } as any;

function build(existingStatus: DailyClosureStatus | null) {
  // Emula el filtro del repositorio: ignora cierres rechazados.
  const existing = existingStatus ? { closureId: 'old', status: existingStatus } : null;
  const repo = {
    findActiveByStaffAndDate: jest.fn(async () =>
      existing && existing.status !== DailyClosureStatus.REJECTED ? existing : null),
    create: jest.fn(async (data: object) => ({ closureId: 'new', ...data })),
  };
  const staffService = { findAll: jest.fn().mockResolvedValue([]) };
  const notifications = { notify: jest.fn().mockResolvedValue(undefined) };
  const service = new ClosuresService(repo as any, {} as any, {} as any, staffService as any, notifications as any);
  return { repo, service };
}

describe('ClosuresService.create — alineado con el índice parcial', () => {
  it('sin cierre previo → crea', async () => {
    const { repo, service } = build(null);
    await service.create(dto, collector);
    expect(repo.create).toHaveBeenCalledWith(expect.objectContaining({ status: DailyClosureStatus.PENDING }));
  });

  it('cierre previo rechazado → permite uno nuevo', async () => {
    const { repo, service } = build(DailyClosureStatus.REJECTED);
    await service.create(dto, collector);
    expect(repo.create).toHaveBeenCalled();
  });

  it.each([DailyClosureStatus.PENDING, DailyClosureStatus.VALIDATED])('cierre previo %s → 409', async (status) => {
    const { repo, service } = build(status);
    await expect(service.create(dto, collector)).rejects.toBeInstanceOf(ConflictException);
    expect(repo.create).not.toHaveBeenCalled();
  });
});

describe('ClosuresRepository.findActiveByStaffAndDate', () => {
  it('excluye status rejected en el WHERE', async () => {
    const orm = { findOne: jest.fn().mockResolvedValue(null) };
    await new ClosuresRepository(orm as any).findActiveByStaffAndDate('col-1', '2026-11-10');
    expect(orm.findOne.mock.calls[0][0].where).toEqual({
      staffId: 'col-1',
      closingDate: '2026-11-10',
      status: Not(DailyClosureStatus.REJECTED),
    });
  });
});
