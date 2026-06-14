import {
  Controller,
  Post,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
  Res,
  Body,
  UnauthorizedException,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiTags, ApiOperation, ApiBody } from "@nestjs/swagger";
import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { LoginDto } from "../dto/login.dto";
import { SelectSocietyDto } from "../dto/select-society.dto";
import { Public } from "../../../common/decorators/public.decorator";
import { CurrentUser } from "../../../common/decorators/current-user.decorator";
import { JwtPayload } from "../interfaces/jwt-payload.interface";

const REFRESH_COOKIE = "refresh_token";

const cookieOptions = (isProduction: boolean) => ({
  httpOnly: true,
  sameSite: "strict" as const,
  secure: isProduction,
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000,
});

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  private readonly isProduction = process.env.NODE_ENV === "production";

  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post("login")
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard("local"))
  @ApiOperation({
    summary:
      "Iniciar sesion — devuelve accessToken y datos basicos del usuario",
  })
  @ApiBody({ type: LoginDto })
  async login(
    @Req() req: Request & { user: JwtPayload },
    @Res({ passthrough: true }) res: Response
  ) {
    const { accessToken, refreshToken, user } = await this.authService.login(
      req.user
    );

    res.cookie(REFRESH_COOKIE, refreshToken, cookieOptions(this.isProduction));

    return { accessToken, user };
  }

  @Public()
  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Renovar access token usando refresh token (cookie HttpOnly)",
  })
  refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const token = (req.cookies as Record<string, string>)?.[REFRESH_COOKIE];
    if (!token) throw new UnauthorizedException("Sin refresh token");

    const { accessToken, refreshToken } = this.authService.refresh(token);

    res.cookie(REFRESH_COOKIE, refreshToken, cookieOptions(this.isProduction));

    return { accessToken };
  }

  @Post("select-society")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Seleccionar sociedad — emite nuevo JWT con societyId elegido",
  })
  @ApiBody({ type: SelectSocietyDto })
  async selectSociety(
    @CurrentUser() currentUser: JwtPayload,
    @Body() dto: SelectSocietyDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken, societyId } =
      await this.authService.selectSociety(currentUser, dto.societyId);

    res.cookie(REFRESH_COOKIE, refreshToken, cookieOptions(this.isProduction));

    return { accessToken, societyId };
  }

  @Post("logout")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Cerrar sesion — limpia el refresh token" })
  logout(
    @CurrentUser() _user: JwtPayload,
    @Res({ passthrough: true }) res: Response
  ): void {
    this.authService.logout();
    res.clearCookie(REFRESH_COOKIE, { path: "/" });
  }
}
