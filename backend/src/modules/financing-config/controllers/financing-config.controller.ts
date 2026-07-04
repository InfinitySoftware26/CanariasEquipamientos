import { Controller, Get, Put, Delete, Body, Param, UseGuards, ParseUUIDPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FinancingConfigService } from '../services/financing-config.service';
import { UpdateFinancingConfigDto } from '../dto/update-financing-config.dto';
import { UpsertProductFinancingConfigDto } from '../dto/upsert-product-financing-config.dto';
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
  @ApiOperation({ summary: 'Actualizar tasas de financiación global' })
  updateConfig(@Body() dto: UpdateFinancingConfigDto, @CurrentUser() user: JwtPayload) {
    return this.financingConfigService.updateConfig(user.societyId, dto);
  }

  @Get('products')
  @ApiOperation({ summary: 'Listar configuraciones financieras específicas por producto' })
  listProductOverrides(@CurrentUser() user: JwtPayload) {
    return this.financingConfigService.listProductOverrides(user.societyId);
  }

  @Put('products/:productId')
  @Roles(StaffRole.ADMIN, StaffRole.MANAGER, StaffRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Crear o actualizar financiación específica de un producto' })
  upsertProductOverride(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Body() dto: UpsertProductFinancingConfigDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.financingConfigService.upsertProductOverride(productId, user.societyId, dto);
  }

  @Delete('products/:productId')
  @Roles(StaffRole.ADMIN, StaffRole.MANAGER, StaffRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar financiación específica de un producto (vuelve a usar la global)' })
  deleteProductOverride(@Param('productId', ParseUUIDPipe) productId: string) {
    return this.financingConfigService.deleteProductOverride(productId);
  }
}
