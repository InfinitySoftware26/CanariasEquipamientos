import {
  Injectable, UnauthorizedException, ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { StaffService } from '../../staff/services/staff.service';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

export interface AuthTokens {
  accessToken:  string;
  refreshToken: string;
}

export interface LoginResult {
  accessToken: string;
  user: Omit<JwtPayload, 'iat' | 'exp'>;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly staffService: StaffService,
    private readonly jwtService:   JwtService,
    private readonly configService: ConfigService,
  ) {}

  // Lanza excepción deliberadamente vaga para no revelar si el email existe
  async validateCredentials(email: string, password: string): Promise<JwtPayload> {
    const staff = await this.staffService.findByEmailWithPassword(email);

    if (!staff) {
      throw new UnauthorizedException('Credenciales invalidas');
    }

    const isMatch = await bcrypt.compare(password, staff.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Credenciales invalidas');
    }

    return {
      sub:       staff.staffId,
      email:     staff.email,
      role:      staff.role,
      societyId: staff.primarySocietyId,
    };
  }

  // Devuelve tokens puros — el controller maneja las cookies
  login(payload: JwtPayload): LoginResult {
    return {
      accessToken: this.signAccess(payload),
      user: {
        sub:       payload.sub,
        email:     payload.email,
        role:      payload.role,
        societyId: payload.societyId,
      },
    };
  }

  // Devuelve tokens puros — el controller maneja las cookies
  refreshTokens(token: string): AuthTokens {
    try {
      const payload = this.jwtService.verify<JwtPayload>(token, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });
      const newPayload: JwtPayload = {
        sub:       payload.sub,
        email:     payload.email,
        role:      payload.role,
        societyId: payload.societyId,
      };
      return {
        accessToken:  this.signAccess(newPayload),
        refreshToken: this.signRefresh(newPayload),
      };
    } catch {
      throw new ForbiddenException('Refresh token invalido o expirado');
    }
  }

  // Retorna void — el controller limpia la cookie
  logout(): void {
    // Aquí se puede implementar blacklist de tokens en BD si se requiere
  }

  private signAccess(p: JwtPayload): string {
    return this.jwtService.sign(
      { sub: p.sub, email: p.email, role: p.role, societyId: p.societyId },
      { expiresIn: this.configService.get<string>('JWT_EXPIRATION') ?? '15m' },
    );
  }

  private signRefresh(p: JwtPayload): string {
    return this.jwtService.sign(
      { sub: p.sub, email: p.email, role: p.role, societyId: p.societyId },
      {
        secret:    this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRATION') ?? '7d',
      },
    );
  }
}
