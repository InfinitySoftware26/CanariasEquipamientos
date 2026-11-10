import { ForbiddenException } from '@nestjs/common';
import { societyScopeOf } from './society-scope.util';
import { StaffRole } from '../enums/staff-role.enum';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

const user = (role: StaffRole, societyId = 'soc-a'): JwtPayload => ({
  sub: 'staff-1', email: 'x@x.com', role, societyId,
});

describe('societyScopeOf', () => {
  it.each([StaffRole.MANAGER, StaffRole.ADMIN, StaffRole.SELLER, StaffRole.COLLECTOR])(
    '%s → filtra por su sociedad',
    (role) => expect(societyScopeOf(user(role))).toBe('soc-a'),
  );

  it('SUPER_ADMIN → sin filtro', () => {
    expect(societyScopeOf(user(StaffRole.SUPER_ADMIN))).toBeUndefined();
  });

  it('SUPER_ADMIN sin sociedad → sin filtro', () => {
    expect(societyScopeOf(user(StaffRole.SUPER_ADMIN, ''))).toBeUndefined();
  });

  it('usuario no SUPER_ADMIN sin sociedad → 403 (nunca desactiva el filtro)', () => {
    expect(() => societyScopeOf(user(StaffRole.ADMIN, ''))).toThrow(ForbiddenException);
  });
});
