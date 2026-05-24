import { Controller, Get, Post, Body, Param, Patch, UseGuards, HttpCode, HttpStatus, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SalesService } from '../services/sales.service';
import { CreateSaleDto } from '../dto/create-sale.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { SocietyGuard } from '../../../common/guards/society.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { StaffRole } from '../../../common/enums/staff-role.enum';

@ApiTags('sales')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard, SocietyGuard)
@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  @Roles(StaffRole.VENDEDOR)
  @ApiOperation({ summary: 'Cargar nueva venta (vendedor)' })
  create(@Body() dto: CreateSaleDto, @CurrentUser() user: any) {
    return this.salesService.createSale(dto, user.sub, user.societyId);
  }

  @Get('pending')
  @Roles(StaffRole.ADMINISTRATIVO, StaffRole.GERENTE)
  @ApiOperation({ summary: 'Ventas pendientes de validacion' })
  findPending(@CurrentUser() user: any) {
    return this.salesService.findPendingValidation(user.societyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener venta por ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.salesService.findById(id);
  }

  @Patch(':id/validate')
  @Roles(StaffRole.ADMINISTRATIVO, StaffRole.GERENTE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Validar venta con visita ambiental' })
  validate(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { status: 'approved' | 'rejected'; observations: string },
    @CurrentUser() user: any,
  ) {
    return this.salesService.validateSale(id, user.sub, body.status, body.observations);
  }
}
