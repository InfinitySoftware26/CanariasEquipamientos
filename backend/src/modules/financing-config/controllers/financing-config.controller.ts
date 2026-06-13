import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FinancingConfigService } from '../services/financing-config.service';
import { UpdateFinancingConfigDto } from '../dto/update-financing-config.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { SocietyGuard } from '../../../common/guards/society.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { StaffRole } from '../../../common/enums/staff-role.enum';
import { JwtPayload } from '../../auth/interfaces/jwt-payload.interface';

@ApiTags('financing-config')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard, SocietyGuard)
@Controller('financing-config')
export class FinancingConfigController {
  constructor(private readonly financingConfigService: FinancingConfigService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener configuración de financiación de la sociedad' })
  getConfig(@CurrentUser() user: JwtPayload) {
    return this.financingConfigService.getConfig(user.societyId);
  }

  @Put()
  @Roles(StaffRole.ADMIN, StaffRole.MANAGER, StaffRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Actualizar tasas de financiación' })
  updateConfig(@Body() dto: UpdateFinancingConfigDto, @CurrentUser() user: JwtPayload) {
    return this.financingConfigService.updateConfig(user.societyId, dto);
  }
}
