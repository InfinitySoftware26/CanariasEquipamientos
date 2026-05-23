import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { StaffService } from '../../staff/services/staff.service';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly staffService: StaffService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async validateCredentials(email: string, password: string): Promise<JwtPayload | null> {
    const staff = await this.staffService.findByEmailWithPassword(email);
    if (!staff) return null;
    const isMatch = await bcrypt.compare(password, staff.passwordHash);
    if (!isMatch) return null;
    return { sub: staff.staffId, email: staff.email, role: staff.role, societyId: staff.primarySocietyId };
  }

  async login(payload: JwtPayload, res: any) {
    const accessToken  = this.signAccess(payload);
    const refreshToken = this.signRefresh(payload);
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure:   this.configService.get('NODE_ENV') === 'production',
      sameSite: 'strict',
      maxAge:   7 * 24 * 60 * 60 * 1000,
    });
    return { accessToken, user: payload };
  }

  async refreshToken(req: any, res: any) {
    const token = req.cookies?.refresh_token;
    if (!token) throw new UnauthorizedException('Sin refresh token');
    try {
      const payload = this.jwtService.verify<JwtPayload>(token, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });
      const newP: JwtPayload = { sub: payload.sub, email: payload.email, role: payload.role, societyId: payload.societyId };
      res.cookie('refresh_token', this.signRefresh(newP), {
        httpOnly: true, secure: this.configService.get('NODE_ENV') === 'production',
        sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      return { accessToken: this.signAccess(newP) };
    } catch { throw new ForbiddenException('Refresh token invalido o expirado'); }
  }

  async logout(_staffId: string, res: any) { res.clearCookie('refresh_token'); }

  private signAccess(p: JwtPayload)  {
    return this.jwtService.sign(
      { sub: p.sub, email: p.email, role: p.role, societyId: p.societyId },
      { expiresIn: this.configService.get('JWT_EXPIRATION') ?? '15m' },
    );
  }
  private signRefresh(p: JwtPayload) {
    return this.jwtService.sign(
      { sub: p.sub, email: p.email, role: p.role, societyId: p.societyId },
      { secret: this.configService.get('JWT_REFRESH_SECRET'), expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION') ?? '7d' },
    );
  }
}
