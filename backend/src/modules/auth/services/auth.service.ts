import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import * as bcrypt from "bcrypt";
import { StaffService } from "../../staff/services/staff.service";
import { JwtPayload } from "../interfaces/jwt-payload.interface";

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  user: {
    staffId: string;
    name: string;
    email: string;
    role: string;
    societyId: string;
  };
}

export interface RefreshResult {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly staffService: StaffService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  async validateCredentials(
    email: string,
    password: string
  ): Promise<JwtPayload> {
    const staff = await this.staffService.findByEmailWithPassword(email);
    if (!staff) throw new UnauthorizedException("Credenciales invalidas");

    const isMatch = await bcrypt.compare(password, staff.passwordHash);
    if (!isMatch) throw new UnauthorizedException("Credenciales invalidas");

    return {
      sub: staff.staffId,
      email: staff.email,
      role: staff.role,
      societyId: staff.primarySocietyId,
    };
  }

  async login(payload: JwtPayload): Promise<LoginResult> {
    const staff = await this.staffService.findById(payload.sub);

    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload),
      user: {
        staffId: staff.staffId,
        name: staff.name,
        email: staff.email,
        role: staff.role,
        societyId: staff.primarySocietyId,
      },
    };
  }

  refresh(token: string): RefreshResult {
    try {
      const payload = this.jwtService.verify<JwtPayload>(token, {
        secret: this.configService.get<string>("JWT_REFRESH_SECRET"),
      });

      const newPayload: JwtPayload = {
        sub: payload.sub,
        email: payload.email,
        role: payload.role,
        societyId: payload.societyId,
      };

      return {
        accessToken: this.generateAccessToken(newPayload),
        refreshToken: this.generateRefreshToken(newPayload),
      };
    } catch {
      throw new ForbiddenException("Refresh token invalido o expirado");
    }
  }

  logout(): void {
    /* extensible: blacklist */
  }

  // ─── MÉTODOS PRIVADOS ─────────────────────────────────────────────────────

  private generateAccessToken(payload: JwtPayload): string {
    return this.jwtService.sign(
      {
        sub: payload.sub,
        email: payload.email,
        role: payload.role,
        societyId: payload.societyId,
      },
      { expiresIn: this.configService.get<string>("JWT_EXPIRATION") ?? "15m" }
    );
  }

  private generateRefreshToken(payload: JwtPayload): string {
    return this.jwtService.sign(
      {
        sub: payload.sub,
        email: payload.email,
        role: payload.role,
        societyId: payload.societyId,
      },
      {
        secret: this.configService.get<string>("JWT_REFRESH_SECRET"),
        expiresIn:
          this.configService.get<string>("JWT_REFRESH_EXPIRATION") ?? "7d",
      }
    );
  }
}
