import {
  Controller, Get, Param, Query, Res,
  UseGuards, ParseUUIDPipe,
} from '@nestjs/common';
import type { Response } from 'express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ReportsService } from '../services/reports.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { SocietyGuard } from '../../../common/guards/society.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { StaffRole } from '../../../common/enums/staff-role.enum';
import { JwtPayload } from '../../auth/interfaces/jwt-payload.interface';

@ApiTags('reports')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard, SocietyGuard)
@Roles(StaffRole.ADMIN, StaffRole.MANAGER, StaffRole.SUPER_ADMIN)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  // ─── SPRINT 04 · COBRANZA ─────────────────────────────────────────────────

  @Get('route-sheets/:id/pdf')
  @Roles(StaffRole.ADMIN, StaffRole.MANAGER, StaffRole.COLLECTOR, StaffRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Hoja de ruta en PDF' })
  async routeSheetPdf(@Param('id', ParseUUIDPipe) id: string, @Res() res: Response) {
    const pdf = await this.reportsService.routeSheetPdf(id);
    res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="hoja-de-ruta-${id}.pdf"` });
    res.send(pdf);
  }

  @Get('collections/excel')
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  @ApiOperation({ summary: 'Cobranzas diarias en Excel' })
  async collectionsExcel(@CurrentUser() user: JwtPayload, @Res() res: Response, @Query('from') from?: string, @Query('to') to?: string) {
    const excel = await this.reportsService.collectionsExcel(user.societyId, from, to);
    res.set({ 'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'Content-Disposition': 'attachment; filename="cobranzas.xlsx"' });
    res.send(excel);
  }

  @Get('installments/pending/excel')
  @ApiOperation({ summary: 'Cuotas pendientes en Excel' })
  async pendingInstallmentsExcel(@CurrentUser() user: JwtPayload, @Res() res: Response) {
    const excel = await this.reportsService.pendingInstallmentsExcel(user.societyId);
    res.set({ 'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'Content-Disposition': 'attachment; filename="cuotas-pendientes.xlsx"' });
    res.send(excel);
  }

  @Get('failed-visits/pdf')
  @ApiOperation({ summary: 'Visitas de cobranza fallidas en PDF' })
  async failedVisitsPdf(@CurrentUser() user: JwtPayload, @Res() res: Response) {
    const pdf = await this.reportsService.failedVisitsPdf(user.societyId);
    res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': 'attachment; filename="visitas-fallidas.pdf"' });
    res.send(pdf);
  }

  // ─── SPRINT 05 · FINANCIERO ───────────────────────────────────────────────

  @Get('cashbox/:id/pdf')
  @ApiOperation({ summary: 'Cierre de caja en PDF' })
  async cashboxClosurePdf(@Param('id', ParseUUIDPipe) id: string, @Res() res: Response) {
    const pdf = await this.reportsService.cashboxClosurePdf(id);
    res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="cierre-caja-${id}.pdf"` });
    res.send(pdf);
  }

  @Get('cash-movements/excel')
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  @ApiOperation({ summary: 'Movimientos financieros en Excel' })
  async cashMovementsExcel(@CurrentUser() user: JwtPayload, @Res() res: Response, @Query('from') from?: string, @Query('to') to?: string) {
    const excel = await this.reportsService.cashMovementsExcel(user.societyId, from, to);
    res.set({ 'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'Content-Disposition': 'attachment; filename="movimientos-caja.xlsx"' });
    res.send(excel);
  }

  @Get('supplier-payments/excel')
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  @ApiOperation({ summary: 'Pagos a proveedores en Excel' })
  async supplierPaymentsExcel(@CurrentUser() user: JwtPayload, @Res() res: Response, @Query('from') from?: string, @Query('to') to?: string) {
    const excel = await this.reportsService.supplierPaymentsExcel(user.societyId, from, to);
    res.set({ 'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'Content-Disposition': 'attachment; filename="pagos-proveedores.xlsx"' });
    res.send(excel);
  }

  @Get('receipts/:id/pdf')
  @ApiOperation({ summary: 'Recibo en PDF (exportación desde reportes)' })
  async receiptPdf(@Param('id', ParseUUIDPipe) id: string, @Res() res: Response) {
    const pdf = await this.reportsService.receiptPdf(id);
    res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="recibo-${id}.pdf"` });
    res.send(pdf);
  }
}
