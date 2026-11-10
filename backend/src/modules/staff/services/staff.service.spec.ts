import { NotFoundException } from '@nestjs/common';
import { StaffService } from './staff.service';
import { StaffRepository } from '../repositories/staff.repository';
import { StaffRole } from '../../../common/enums/staff-role.enum';
import { JwtPayload } from '../../../common/interfaces/jwt-payload.interface';

const SOC_A = 'soc-a';
const SOC_B = 'soc-b';
const SOC_C = 'soc-c';
const TARGET_ID = '11111111-1111-4111-8111-111111111111';

/**
 * Empleado con sociedad primaria A y asignación activa en B.
 * Una asignación inactiva en C no otorga pertenencia.
 */
const target = { staffId: TARGET_ID, role: StaffRole.SELLER, primarySocietyId: SOC_A };
const activeAssignments = new Set([SOC_B]);

const user = (role: StaffRole, societyId: string): JwtPayload => ({
  sub: 'manager-1', email: 'x@x.com', role, societyId,
});

function build() {
  const repo = {
    findById: jest.fn(async (id: string, societyId?: string) => {
      if (id !== TARGET_ID) return null;
      if (societyId === undefined) return target;
      return societyId === target.primarySocietyId || activeAssignments.has(societyId) ? target : null;
    }),
    update: jest.fn().mockResolvedValue(target),
  };
  return { repo, service: new StaffService(repo as any, {} as any) };
}

describe('StaffService — pertenencia a sociedad (Bloque 0b)', () => {
  it.each([
    ['sociedad primaria', SOC_A],
    ['asignación activa en STAFF_SOCIETIES', SOC_B],
  ])('deactivate desde %s → OK', async (_desc, soc) => {
    const { repo, service } = build();
    await service.deactivate(TARGET_ID, user(StaffRole.MANAGER, soc));
    expect(repo.findById).toHaveBeenCalledWith(TARGET_ID, soc);
    expect(repo.update).toHaveBeenCalledWith(TARGET_ID, { isActive: false });
  });

  it('deactivate desde sociedad sin vínculo activo → 404 sin escribir', async () => {
    const { repo, service } = build();
    await expect(service.deactivate(TARGET_ID, user(StaffRole.MANAGER, SOC_C))).rejects.toBeInstanceOf(NotFoundException);
    expect(repo.update).not.toHaveBeenCalled();
  });

  it('deactivate SUPER_ADMIN → OK sin filtro', async () => {
    const { repo, service } = build();
    await service.deactivate(TARGET_ID, user(StaffRole.SUPER_ADMIN, SOC_C));
    expect(repo.findById).toHaveBeenCalledWith(TARGET_ID, undefined);
    expect(repo.update).toHaveBeenCalled();
  });

  it('update (PATCH :id): propio OK, cruzado 404, SUPER_ADMIN OK', async () => {
    const { repo, service } = build();
    await service.update(TARGET_ID, { name: 'n' } as any, user(StaffRole.ADMIN, SOC_A));
    await service.update(TARGET_ID, { name: 'n' } as any, user(StaffRole.SUPER_ADMIN, SOC_C));
    expect(repo.update).toHaveBeenCalledTimes(2);

    await expect(service.update(TARGET_ID, { name: 'n' } as any, user(StaffRole.ADMIN, SOC_C)))
      .rejects.toBeInstanceOf(NotFoundException);
    expect(repo.update).toHaveBeenCalledTimes(2);
  });
});

describe('StaffRepository.findById — consulta de pertenencia', () => {
  function qbSpy() {
    const calls: { where: unknown[][]; andWhere: unknown[][] } = { where: [], andWhere: [] };
    const qb: any = {
      where: jest.fn((...a: unknown[]) => { calls.where.push(a); return qb; }),
      andWhere: jest.fn((...a: unknown[]) => { calls.andWhere.push(a); return qb; }),
      getOne: jest.fn().mockResolvedValue(null),
    };
    return { qb, calls };
  }

  it('sin sociedad → findOne solo por ID', async () => {
    const orm = { findOne: jest.fn().mockResolvedValue(null), createQueryBuilder: jest.fn() };
    await new StaffRepository(orm as any).findById(TARGET_ID);
    expect(orm.findOne).toHaveBeenCalledWith({ where: { staffId: TARGET_ID } });
    expect(orm.createQueryBuilder).not.toHaveBeenCalled();
  });

  it('con sociedad → filtra por primaria o asignación activa en el WHERE', async () => {
    const { qb, calls } = qbSpy();
    const orm = { createQueryBuilder: jest.fn(() => qb) };
    await new StaffRepository(orm as any).findById(TARGET_ID, SOC_A);

    expect(calls.where[0]).toEqual(['staff.staffId = :id', { id: TARGET_ID }]);
    // El Brackets arma: primaria OR EXISTS(STAFF_SOCIETIES activa).
    const brackets = calls.andWhere[0][0] as { whereFactory: (b: any) => void };
    const inner: string[] = [];
    const params: Record<string, unknown> = {};
    const b: any = {
      where: (sql: string, p?: object) => { inner.push(sql); Object.assign(params, p); return b; },
      orWhere: (sql: string, p?: object) => { inner.push(sql); Object.assign(params, p); return b; },
    };
    brackets.whereFactory(b);
    expect(inner[0]).toBe('staff.primarySocietyId = :societyId');
    expect(inner[1]).toMatch(/EXISTS \(SELECT 1 FROM "STAFF_SOCIETIES"/);
    expect(inner[1]).toMatch(/ss\.status = :activeStatus/);
    expect(params).toEqual({ societyId: SOC_A, activeStatus: 'active' });
  });
});
