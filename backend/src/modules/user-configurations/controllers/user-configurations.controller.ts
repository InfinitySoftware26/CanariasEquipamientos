import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UserConfigurationsService } from '../services/user-configurations.service';
import { UpdateUserConfigurationDto } from '../dto/update-user-configuration.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { SocietyGuard } from '../../../common/guards/society.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../auth/interfaces/jwt-payload.interface';

@ApiTags('user-configurations')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard, SocietyGuard)
@Controller('user-configurations')
export class UserConfigurationsController {
  constructor(private readonly userConfigurationsService: UserConfigurationsService) {}

  @Get()
  @ApiOperation({ summary: 'Preferencias del usuario autenticado (se crean con valores por defecto si no existen)' })
  findMine(@CurrentUser() user: JwtPayload) {
    return this.userConfigurationsService.findForStaff(user.sub);
  }

  @Patch()
  @ApiOperation({ summary: 'Actualizar preferencias del usuario autenticado' })
  update(@Body() dto: UpdateUserConfigurationDto, @CurrentUser() user: JwtPayload) {
    return this.userConfigurationsService.update(user.sub, dto);
  }
}
