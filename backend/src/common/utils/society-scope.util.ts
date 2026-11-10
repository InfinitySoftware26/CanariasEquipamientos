import { ForbiddenException } from '@nestjs/common';
import { StaffRole } from '../enums/staff-role.enum';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

/**
 * Devuelve la sociedad por la que debe filtrarse una consulta por ID.
 *
 * - SUPER_ADMIN → `undefined` (sin filtro: visibilidad global).
 * - Resto de roles → `user.societyId`.
 *
 * Los repositorios reciben este valor y lo agregan al WHERE; si el registro
 * pertenece a otra sociedad la consulta no lo encuentra y el service responde
 * 404, sin revelar su existencia.
 *
 * Un usuario no SUPER_ADMIN sin sociedad en el token se rechaza: devolver
 * `undefined` en ese caso desactivaría el filtro.
 */
export function societyScopeOf(user: JwtPayload): string | undefined {
  if (user.role === StaffRole.SUPER_ADMIN) return undefined;
  if (!user.societyId) {
    throw new ForbiddenException('El usuario no tiene una sociedad asignada');
  }
  return user.societyId;
}
