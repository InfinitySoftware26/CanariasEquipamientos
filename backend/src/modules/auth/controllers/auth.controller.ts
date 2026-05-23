import { Controller, Post, UseGuards, HttpCode, HttpStatus, Req, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import { Public } from '../../../common/decorators/public.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('local'))
  @ApiOperation({ summary: 'Iniciar sesion' })
  login(@Req() req: any, @Res({ passthrough: true }) res: any) {
    return this.authService.login(req.user, res);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Renovar access token' })
  refresh(@Req() req: any, @Res({ passthrough: true }) res: any) {
    return this.authService.refreshToken(req, res);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Cerrar sesion' })
  logout(@CurrentUser() user: any, @Res({ passthrough: true }) res: any) {
    return this.authService.logout(user.sub, res);
  }
}
