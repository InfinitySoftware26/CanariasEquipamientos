import { ForbiddenException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { StaffService } from './staff.service';
import { UpdateStaffDto } from '../dto/update-staff.dto';
import { StaffRole } from '../../../common/enums/staff-role.enum';
import { JwtPayload } from '../../../common/interfaces/jwt-payload.interface';

const SOC = 'soc-a';

/** Empleados de la sociedad, indexados por ID. */
const people: Record<string, { staffId: string; role: StaffRole; primarySocietyId: string }> = {
  sa: { staffId: 'sa', role: StaffRole.SUPER_ADMIN, primarySocietyId: SOC },
  mgr: { staffId: 'mgr', role: StaffRole.MANAGER, primarySocietyId: SOC },
  mgr2: { staffId: 'mgr2', role: StaffRole.MANAGER, primarySocietyId: SOC },
  adm: { staffId: 'adm', role: StaffRole.ADMIN, primarySocietyId: SOC },
  adm2: { staffId: 'adm2', role: StaffRole.ADMIN, primarySocietyId: SOC },
  sel: { staffId: 'sel', role: StaffRole.SELLER, primarySocietyId: SOC },
  col: { staffId: 'col', role: StaffRole.COLLECTOR, primarySocietyId: SOC },
};

const actor = (id: keyof typeof people): JwtPayload => ({
  sub: id, email: `${id}@x.com`, role: people[id].role, societyId: SOC,
});

function build() {
  const repo = {
    findById: jest.fn(async (id: string) => people[id] ?? null),
    update: jest.fn(async (id: string) => people[id]),
  };
  return { repo, service: new StaffService(repo as any, {} as any) };
}

const dto = (data: object) => data as UpdateStaffDto;

describe('UpdateStaffDto.role', () => {
  it('rechaza super_admin (solo se crea por POST /staff/super-admin)', async () => {
    const errors = await validate(plainToInstance(UpdateStaffDto, { role: 'super_admin' }));
    expect(errors.map((e) => e.property)).toContain('role');
  });

  it('acepta roles asignables', async () => {
    const errors = await validate(plainToInstance(UpdateStaffDto, { role: 'cobrador' }));
    expect(errors).toHaveLength(0);
  });
});

describe('StaffService.update — permisos', () => {
  describe('escalada propia', () => {
    it.each([
      ['ADMIN se asigna gerente', 'adm', { role: StaffRole.MANAGER }],
      ['MANAGER cambia su rol', 'mgr', { role: StaffRole.ADMIN }],
      ['ADMIN se reactiva/desactiva', 'adm', { isActive: false }],
      ['SUPER_ADMIN cambia su propio rol', 'sa', { role: StaffRole.MANAGER }],
      ['SUPER_ADMIN cambia su propio isActive', 'sa', { isActive: false }],
      ['SELLER cambia su email (dato sensible)', 'sel', { email: 'otro@x.com' }],
    ] as const)('%s → 403 sin escribir', async (_d, who, data) => {
      const { repo, service } = build();
      await expect(service.update(who, dto(data), actor(who))).rejects.toBeInstanceOf(ForbiddenException);
      expect(repo.update).not.toHaveBeenCalled();
    });
  });

  describe('edición de datos propios', () => {
    it.each(['sel', 'col', 'adm', 'mgr', 'sa'] as const)('%s edita nombre, teléfono y dirección → OK', async (who) => {
      const { repo, service } = build();
      await service.update(who, dto({ name: 'N', phone: '1', address: 'A' }), actor(who));
      expect(repo.update).toHaveBeenCalledWith(who, { name: 'N', phone: '1', address: 'A' });
    });
  });

  describe('escalada ajena', () => {
    it('ADMIN promueve un vendedor a gerente → 403 (fuera de CREATION_PERMISSIONS)', async () => {
      const { repo, service } = build();
      await expect(service.update('sel', dto({ role: StaffRole.MANAGER }), actor('adm'))).rejects.toBeInstanceOf(ForbiddenException);
      expect(repo.update).not.toHaveBeenCalled();
    });

    it('MANAGER promueve un vendedor a gerente → 403', async () => {
      const { service } = build();
      await expect(service.update('sel', dto({ role: StaffRole.MANAGER }), actor('mgr'))).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('MANAGER cambia vendedor a cobrador → OK (permitido por CREATION_PERMISSIONS)', async () => {
      const { repo, service } = build();
      await service.update('sel', dto({ role: StaffRole.COLLECTOR }), actor('mgr'));
      expect(repo.update).toHaveBeenCalledWith('sel', { role: StaffRole.COLLECTOR });
    });
  });

  describe('rol superior o igual', () => {
    it.each([
      ['ADMIN edita a MANAGER (superior)', 'adm', 'mgr'],
      ['ADMIN edita a otro ADMIN (igual)', 'adm', 'adm2'],
      ['MANAGER edita a otro MANAGER (igual)', 'mgr', 'mgr2'],
      ['MANAGER edita a SUPER_ADMIN (superior)', 'mgr', 'sa'],
      ['SELLER edita a COLLECTOR (igual)', 'sel', 'col'],
    ] as const)('%s → 403', async (_d, who, target) => {
      const { repo, service } = build();
      await expect(service.update(target, dto({ name: 'x' }), actor(who))).rejects.toBeInstanceOf(ForbiddenException);
      expect(repo.update).not.toHaveBeenCalled();
    });

    it('ADMIN edita a un vendedor (inferior) → OK', async () => {
      const { repo, service } = build();
      await service.update('sel', dto({ name: 'x' }), actor('adm'));
      expect(repo.update).toHaveBeenCalled();
    });
  });

  describe('SUPER_ADMIN', () => {
    it('edita a un MANAGER y le cambia el rol → OK', async () => {
      const { repo, service } = build();
      await service.update('mgr', dto({ role: StaffRole.ADMIN, isActive: true }), actor('sa'));
      expect(repo.update).toHaveBeenCalledWith('mgr', { role: StaffRole.ADMIN, isActive: true });
    });
  });
});

describe('StaffService.deactivate — permisos', () => {
  it.each([
    ['ADMIN desactiva a MANAGER (superior)', 'adm', 'mgr'],
    ['ADMIN desactiva a otro ADMIN (igual)', 'adm', 'adm2'],
    ['MANAGER se desactiva a sí mismo', 'mgr', 'mgr'],
    ['SUPER_ADMIN se desactiva a sí mismo', 'sa', 'sa'],
  ] as const)('%s → 403', async (_d, who, target) => {
    const { repo, service } = build();
    await expect(service.deactivate(target, actor(who))).rejects.toBeInstanceOf(ForbiddenException);
    expect(repo.update).not.toHaveBeenCalled();
  });

  it.each([
    ['MANAGER desactiva a ADMIN', 'mgr', 'adm'],
    ['ADMIN desactiva a COLLECTOR', 'adm', 'col'],
    ['SUPER_ADMIN desactiva a MANAGER', 'sa', 'mgr'],
  ] as const)('%s → OK', async (_d, who, target) => {
    const { repo, service } = build();
    await service.deactivate(target, actor(who));
    expect(repo.update).toHaveBeenCalledWith(target, { isActive: false });
  });
});
