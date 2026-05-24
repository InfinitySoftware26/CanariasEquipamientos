import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class SocietyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const paramSocietyId = req.params?.societyId;
    const tokenSocietyId = req.user?.societyId;
    if (paramSocietyId && paramSocietyId !== tokenSocietyId) {
      throw new ForbiddenException('Acceso denegado a esta sociedad');
    }
    req.societyId = tokenSocietyId;
    return true;
  }
}
