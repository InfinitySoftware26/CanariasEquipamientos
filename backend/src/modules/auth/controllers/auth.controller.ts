import {
  Controller, Post, UseGuards,
  HttpCode, HttpStatus, Req, Res,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { LoginDto } from '../dto/login.dto';
import { Public } from '../../../common/decorators/public.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'strict' as const,
  path:     '/',
};

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('local'))
  @ApiOperation({ summary: 'Iniciar sesion' })
  @ApiBody({ type: LoginDto })
  login(
    @Req() req: Request & { user: JwtPayload },
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = this.authService.login(req.user);

    // El controller es el único responsable de manejar cookies
    res.cookie('refresh_token', result.accessToken, {
      ...COOKIE_OPTIONS,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { accessToken: result.accessToken, user: result.user };
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Renovar access token usando refresh token (cookie)' })
  refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = (req.cookies as Record<string, string>)?.refresh_token;
    if (!token) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        statusCode: 401,
        message:    'Sin refresh token',
      });
    }

    const tokens = this.authService.refreshTokens(token);

    res.cookie('refresh_token', tokens.refreshToken, {
      ...COOKIE_OPTIONS,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { accessToken: tokens.accessToken };
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Cerrar sesion — limpia el refresh token' })
  logout(
    @CurrentUser() _user: JwtPayload,
    @Res({ passthrough: true }) res: Response,
  ): void {
    this.authService.logout();
    res.clearCookie('refresh_token', { path: '/' });
  }
}
