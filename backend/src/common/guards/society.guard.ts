import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { StaffRole } from '../enums/staff-role.enum';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

/**
 * SocietyGuard — previene acceso cross-tenant.
 * SUPER_ADMIN esta exento: tiene visibilidad global sobre todas las sociedades.
 */
@Injectable()
export class SocietyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<{
      params:    Record<string, string>;
      user:      JwtPayload;
      societyId: string;
    }>();

    const user = req.user;

    // SUPER_ADMIN bypasea la restriccion de sociedad
    if (user?.role === StaffRole.SUPER_ADMIN) {
      req.societyId = user.societyId;
      return true;
    }

    const paramSocietyId = req.params?.societyId;
    const tokenSocietyId = user?.societyId;

    if (paramSocietyId && paramSocietyId !== tokenSocietyId) {
      throw new ForbiddenException('Acceso denegado a esta sociedad');
    }

    req.societyId = tokenSocietyId;
    return true;
  }
}
