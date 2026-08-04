import { Injectable } from '@nestjs/common';
import { buildPdfTable } from '../utils/pdf-table.util';
import { buildExcelTable } from '../utils/excel-table.util';
import { RouteSheetsService } from '../../route-sheets/services/route-sheets.service';
import { PaymentsService } from '../../payments/services/payments.service';
import { InstallmentsService } from '../../installments/services/installments.service';
import { FailedVisitsService } from '../../failed-visits/services/failed-visits.service';
import { CashboxService } from '../../cashbox/services/cashbox.service';
import { CashMovementsService } from '../../cash-movements/services/cash-movements.service';
import { SupplierPaymentsService } from '../../supplier-payments/services/supplier-payments.service';
import { ReceiptsService } from '../../receipts/services/receipts.service';

@Injectable()
export class ReportsService {
  constructor(
    private readonly routeSheetsService: RouteSheetsService,
    private readonly paymentsService: PaymentsService,
    private readonly installmentsService: InstallmentsService,
    private readonly failedVisitsService: FailedVisitsService,
    private readonly cashboxService: CashboxService,
    private readonly cashMovementsService: CashMovementsService,
    private readonly supplierPaymentsService: SupplierPaymentsService,
    private readonly receiptsService: ReceiptsService,
  ) {}

  // ─── SPRINT 04 · COBRANZA ─────────────────────────────────────────────────

  async routeSheetPdf(routeSheetId: string): Promise<Buffer> {
    const routeSheet = await this.routeSheetsService.findByIdWithItems(routeSheetId);
    const rows = routeSheet.items.map(item => ({
      cliente: item.clientId,
      tipo: item.itemType,
      resultado: item.result,
      monto: item.collectedAmount ?? '',
      notas: item.notes ?? '',
    }));

    return buildPdfTable(
      `Hoja de Ruta — ${routeSheet.staffName ?? routeSheet.staffId} — ${new Date(routeSheet.routeDate).toLocaleDateString('es-AR')}`,
      rows,
      [
        { header: 'Cliente', key: 'cliente', width: 200 },
        { header: 'Tipo', key: 'tipo', width: 120 },
        { header: 'Resultado', key: 'resultado', width: 120 },
        { header: 'Monto', key: 'monto', width: 100 },
        { header: 'Notas', key: 'notas', width: 260 },
      ],
    );
  }

  async collectionsExcel(societyId: string, from?: string, to?: string): Promise<Buffer> {
    const payments = await this.paymentsService.findBySociety(societyId, { from, to });
    const rows = payments.map(p => ({
      fecha: p.paymentDate,
      cliente: p.clientId,
      venta: p.saleId,
      cobrador: p.staffId,
      monto: Number(p.amount),
      metodo: p.method,
    }));

    return buildExcelTable('Cobranzas', rows, [
      { header: 'Fecha', key: 'fecha', width: 22 },
      { header: 'Cliente', key: 'cliente', width: 36 },
      { header: 'Venta', key: 'venta', width: 36 },
      { header: 'Cobrador', key: 'cobrador', width: 36 },
      { header: 'Monto', key: 'monto', width: 15 },
      { header: 'Método', key: 'metodo', width: 15 },
    ]);
  }

  async pendingInstallmentsExcel(societyId: string): Promise<Buffer> {
    const installments = await this.installmentsService.findPendingBySociety(societyId);
    const rows = installments.map(i => ({
      cliente: i.clientId,
      venta: i.saleId,
      numero: i.installmentNumber,
      vencimiento: i.dueDate,
      monto: Number(i.amount),
      pagado: Number(i.paidAmount),
      estado: i.status,
    }));

    return buildExcelTable('Cuotas pendientes', rows, [
      { header: 'Cliente', key: 'cliente', width: 36 },
      { header: 'Venta', key: 'venta', width: 36 },
      { header: 'N° Cuota', key: 'numero', width: 12 },
      { header: 'Vencimiento', key: 'vencimiento', width: 18 },
      { header: 'Monto', key: 'monto', width: 15 },
      { header: 'Pagado', key: 'pagado', width: 15 },
      { header: 'Estado', key: 'estado', width: 15 },
    ]);
  }

  async failedVisitsPdf(societyId: string): Promise<Buffer> {
    const visits = await this.failedVisitsService.findBySociety(societyId);
    const rows = visits.map(v => ({
      cliente: v.clientId,
      cobrador: v.staffId,
      motivo: v.reason,
      intento: v.attemptNumber,
      reprogramada: v.rescheduledDate ?? '',
      fecha: v.createdAt,
    }));

    return buildPdfTable('Visitas de Cobranza Fallidas', rows, [
      { header: 'Cliente', key: 'cliente', width: 180 },
      { header: 'Cobrador', key: 'cobrador', width: 180 },
      { header: 'Motivo', key: 'motivo', width: 140 },
      { header: 'Intento', key: 'intento', width: 60 },
      { header: 'Reprogramada', key: 'reprogramada', width: 100 },
      { header: 'Fecha', key: 'fecha', width: 140 },
    ]);
  }

  // ─── SPRINT 05 · FINANCIERO ───────────────────────────────────────────────

  async cashboxClosurePdf(cashboxId: string): Promise<Buffer> {
    const cashbox = await this.cashboxService.findById(cashboxId);
    const balance = await this.cashboxService.getBalance(cashboxId);

    return buildPdfTable(`Cierre de Caja — ${new Date(cashbox.openingDate).toLocaleDateString('es-AR')}`, [
      { concepto: 'Saldo de apertura', valor: balance.openingBalance },
      { concepto: 'Saldo calculado por el sistema', valor: balance.systemBalance },
      { concepto: 'Saldo declarado al cierre', valor: balance.declaredClosingBalance ?? 'Pendiente' },
      { concepto: 'Estado', valor: cashbox.status },
    ], [
      { header: 'Concepto', key: 'concepto', width: 300 },
      { header: 'Valor', key: 'valor', width: 200 },
    ]);
  }

  async cashMovementsExcel(societyId: string, from?: string, to?: string): Promise<Buffer> {
    const movements = await this.cashMovementsService.findBySociety(societyId, from, to);
    const rows = movements.map(m => ({
      fecha: m.createdAt,
      tipo: m.type,
      concepto: m.concept,
      monto: Number(m.amount),
      caja: m.cashboxId,
    }));

    return buildExcelTable('Movimientos de Caja', rows, [
      { header: 'Fecha', key: 'fecha', width: 22 },
      { header: 'Tipo', key: 'tipo', width: 15 },
      { header: 'Concepto', key: 'concepto', width: 40 },
      { header: 'Monto', key: 'monto', width: 15 },
      { header: 'Caja', key: 'caja', width: 36 },
    ]);
  }

  async supplierPaymentsExcel(societyId: string, from?: string, to?: string): Promise<Buffer> {
    const payments = await this.supplierPaymentsService.findBySociety(societyId, from, to);
    const rows = payments.map(p => ({
      fecha: p.paymentDate,
      proveedor: p.supplierId,
      monto: Number(p.amount),
      metodo: p.method,
      notas: p.notes ?? '',
    }));

    return buildExcelTable('Pagos a Proveedores', rows, [
      { header: 'Fecha', key: 'fecha', width: 22 },
      { header: 'Proveedor', key: 'proveedor', width: 36 },
      { header: 'Monto', key: 'monto', width: 15 },
      { header: 'Método', key: 'metodo', width: 15 },
      { header: 'Notas', key: 'notas', width: 40 },
    ]);
  }

  receiptPdf(receiptId: string): Promise<Buffer> {
    return this.receiptsService.generatePdf(receiptId);
  }
}
