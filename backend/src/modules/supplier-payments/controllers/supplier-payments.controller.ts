import {
  Controller, Get, Post, Body, Param, Query,
  UseGuards, ParseUUIDPipe, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { SupplierPaymentsService } from '../services/supplier-payments.service';
import { CreateSupplierPaymentDto } from '../dto/create-supplier-payment.dto';
import { ApplySupplierPaymentDto } from '../dto/apply-supplier-payment.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { SocietyGuard } from '../../../common/guards/society.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { StaffRole } from '../../../common/enums/staff-role.enum';
import { JwtPayload } from '../../auth/interfaces/jwt-payload.interface';

@ApiTags('supplier-payments')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard, SocietyGuard)
@Controller('supplier-payments')
export class SupplierPaymentsController {
  constructor(private readonly supplierPaymentsService: SupplierPaymentsService) {}

  @Get()
  @Roles(StaffRole.ADMIN, StaffRole.MANAGER, StaffRole.SUPER_ADMIN)
  @ApiQuery({ name: 'from', required: false, description: 'YYYY-MM-DD' })
  @ApiQuery({ name: 'to', required: false, description: 'YYYY-MM-DD' })
  @ApiOperation({ summary: 'Listar pagos a proveedores de la sociedad' })
  findAll(@CurrentUser() user: JwtPayload, @Query('from') from?: string, @Query('to') to?: string) {
    return this.supplierPaymentsService.findBySociety(user.societyId, from, to);
  }

  @Get('supplier/:supplierId')
  @Roles(StaffRole.ADMIN, StaffRole.MANAGER, StaffRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Resumen de pagos y total abonado a un proveedor' })
  getSupplierSummary(@Param('supplierId', ParseUUIDPipe) supplierId: string) {
    return this.supplierPaymentsService.getSupplierSummary(supplierId);
  }

  @Get(':id/applications')
  @Roles(StaffRole.ADMIN, StaffRole.MANAGER, StaffRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Facturas de proveedor cubiertas por un pago' })
  findApplications(@Param('id', ParseUUIDPipe) id: string) {
    return this.supplierPaymentsService.findApplications(id);
  }

  @Post()
  @Roles(StaffRole.ADMIN, StaffRole.MANAGER, StaffRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Registrar pago a proveedor (imputación automática opcional a una factura)' })
  create(@Body() dto: CreateSupplierPaymentDto, @CurrentUser() user: JwtPayload) {
    return this.supplierPaymentsService.create(dto, user);
  }

  @Post(':id/applications')
  @Roles(StaffRole.ADMIN, StaffRole.MANAGER, StaffRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Imputación manual de un pago a una o más facturas de proveedor' })
  applyPayment(@Param('id', ParseUUIDPipe) id: string, @Body() dto: ApplySupplierPaymentDto) {
    return this.supplierPaymentsService.applyPayment(id, dto);
  }
}
