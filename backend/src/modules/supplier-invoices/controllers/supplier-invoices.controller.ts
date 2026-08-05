import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query,
  UseGuards, ParseUUIDPipe, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { SupplierInvoicesService } from '../services/supplier-invoices.service';
import { CreateSupplierInvoiceDto } from '../dto/create-supplier-invoice.dto';
import { UpdateSupplierInvoiceDto } from '../dto/update-supplier-invoice.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { SocietyGuard } from '../../../common/guards/society.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { StaffRole } from '../../../common/enums/staff-role.enum';
import { SupplierInvoiceStatus } from '../../../common/enums/supplier-invoice-status.enum';
import { JwtPayload } from '../../auth/interfaces/jwt-payload.interface';

@ApiTags('supplier-invoices')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard, SocietyGuard)
@Controller('supplier-invoices')
export class SupplierInvoicesController {
  constructor(private readonly supplierInvoicesService: SupplierInvoicesService) {}

  @Get()
  @Roles(StaffRole.ADMIN, StaffRole.MANAGER, StaffRole.SUPER_ADMIN)
  @ApiQuery({ name: 'supplierId', required: false })
  @ApiQuery({ name: 'status', required: false, enum: SupplierInvoiceStatus })
  @ApiQuery({ name: 'from', required: false, description: 'YYYY-MM-DD' })
  @ApiQuery({ name: 'to', required: false, description: 'YYYY-MM-DD' })
  @ApiOperation({ summary: 'Listar facturas de proveedores de la sociedad' })
  findAll(
    @CurrentUser() user: JwtPayload,
    @Query('supplierId') supplierId?: string,
    @Query('status') status?: SupplierInvoiceStatus,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.supplierInvoicesService.findBySociety(user.societyId, { supplierId, status, from, to });
  }

  @Get('supplier/:supplierId/debt')
  @Roles(StaffRole.ADMIN, StaffRole.MANAGER, StaffRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Deuda real de un proveedor (total facturado no anulado - total imputado)' })
  getSupplierDebt(@Param('supplierId', ParseUUIDPipe) supplierId: string) {
    return this.supplierInvoicesService.getSupplierDebt(supplierId);
  }

  @Get(':id')
  @Roles(StaffRole.ADMIN, StaffRole.MANAGER, StaffRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Detalle de una factura de proveedor' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.supplierInvoicesService.findById(id);
  }

  @Get(':id/balance')
  @Roles(StaffRole.ADMIN, StaffRole.MANAGER, StaffRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Saldo pendiente de una factura' })
  getBalance(@Param('id', ParseUUIDPipe) id: string) {
    return this.supplierInvoicesService.getBalance(id);
  }

  @Get(':id/applications')
  @Roles(StaffRole.ADMIN, StaffRole.MANAGER, StaffRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Pagos imputados a una factura' })
  findApplications(@Param('id', ParseUUIDPipe) id: string) {
    return this.supplierInvoicesService.findApplications(id);
  }

  @Post()
  @Roles(StaffRole.ADMIN, StaffRole.MANAGER, StaffRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Registrar factura de proveedor' })
  create(@Body() dto: CreateSupplierInvoiceDto, @CurrentUser() user: JwtPayload) {
    return this.supplierInvoicesService.create(dto, user.societyId);
  }

  @Patch(':id')
  @Roles(StaffRole.ADMIN, StaffRole.MANAGER, StaffRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Actualizar fecha de vencimiento / notas de una factura' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateSupplierInvoiceDto) {
    return this.supplierInvoicesService.update(id, dto);
  }

  @Delete(':id')
  @Roles(StaffRole.ADMIN, StaffRole.MANAGER, StaffRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Anular factura (solo si no tiene pagos imputados)' })
  cancel(@Param('id', ParseUUIDPipe) id: string) {
    return this.supplierInvoicesService.cancel(id);
  }
}
