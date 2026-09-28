import { Injectable } from "@nestjs/common";

import { buildPdfTable } from "../utils/pdf-table.util";
import { buildExcelTable } from "../utils/excel-table.util";

import { RouteSheetsService } from "../../route-sheets/services/route-sheets.service";
import { PaymentsService } from "../../payments/services/payments.service";
import { InstallmentsService } from "../../installments/services/installments.service";
import { FailedVisitsService } from "../../failed-visits/services/failed-visits.service";
import { CashboxService } from "../../cashbox/services/cashbox.service";
import { CashMovementsService } from "../../cash-movements/services/cash-movements.service";
import { SupplierPaymentsService } from "../../supplier-payments/services/supplier-payments.service";
import { ReceiptsService } from "../../receipts/services/receipts.service";

import { JwtPayload } from "../../auth/interfaces/jwt-payload.interface";

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

  async routeSheetPdf(routeSheetId: string, user: JwtPayload): Promise<Buffer> {
    const routeSheet = await this.routeSheetsService.findByIdWithItems(
      routeSheetId,
      user,
    );

    const rows = routeSheet.items.map((item) => ({
      cliente: item.clientName ?? item.clientId,

      tipo: item.itemType,

      cuota: item.installmentNumber ?? "",

      resultado: item.result,

      monto: item.collectedAmount ?? "",

      notas: item.notes ?? "",
    }));

    return buildPdfTable(
      `Hoja de Ruta — ${
        routeSheet.staffName ?? routeSheet.staffId
      } — ${new Date(routeSheet.routeDate).toLocaleDateString("es-AR")}`,
      rows,
      [
        {
          header: "Cliente",
          key: "cliente",
          width: 180,
        },
        {
          header: "Tipo",
          key: "tipo",
          width: 100,
        },
        {
          header: "Cuota",
          key: "cuota",
          width: 60,
        },
        {
          header: "Resultado",
          key: "resultado",
          width: 110,
        },
        {
          header: "Monto",
          key: "monto",
          width: 100,
        },
        {
          header: "Notas",
          key: "notas",
          width: 230,
        },
      ],
    );
  }

  async collectionsExcel(
    societyId: string,
    from?: string,
    to?: string,
  ): Promise<Buffer> {
    const payments = await this.paymentsService.findBySociety(societyId, {
      from,
      to,
    });

    const rows = payments.map((payment) => ({
      fecha: payment.paymentDate,

      cliente: payment.clientId,

      venta: payment.saleId,

      cobrador: payment.staffId,

      monto: Number(payment.amount),

      metodo: payment.method,
    }));

    return buildExcelTable("Cobranzas", rows, [
      {
        header: "Fecha",
        key: "fecha",
        width: 22,
      },
      {
        header: "Cliente",
        key: "cliente",
        width: 36,
      },
      {
        header: "Venta",
        key: "venta",
        width: 36,
      },
      {
        header: "Cobrador",
        key: "cobrador",
        width: 36,
      },
      {
        header: "Monto",
        key: "monto",
        width: 15,
      },
      {
        header: "Método",
        key: "metodo",
        width: 15,
      },
    ]);
  }

  async pendingInstallmentsExcel(societyId: string): Promise<Buffer> {
    const installments =
      await this.installmentsService.findPendingBySociety(societyId);

    const rows = installments.map((installment) => ({
      cliente: installment.clientId,

      venta: installment.saleId,

      numero: installment.installmentNumber,

      vencimiento: installment.dueDate,

      monto: Number(installment.amount),

      pagado: Number(installment.paidAmount),

      estado: installment.status,
    }));

    return buildExcelTable("Cuotas pendientes", rows, [
      {
        header: "Cliente",
        key: "cliente",
        width: 36,
      },
      {
        header: "Venta",
        key: "venta",
        width: 36,
      },
      {
        header: "N° Cuota",
        key: "numero",
        width: 12,
      },
      {
        header: "Vencimiento",
        key: "vencimiento",
        width: 18,
      },
      {
        header: "Monto",
        key: "monto",
        width: 15,
      },
      {
        header: "Pagado",
        key: "pagado",
        width: 15,
      },
      {
        header: "Estado",
        key: "estado",
        width: 15,
      },
    ]);
  }

  async failedVisitsPdf(societyId: string): Promise<Buffer> {
    const visits = await this.failedVisitsService.findBySociety(societyId);

    const rows = visits.map((visit) => ({
      cliente: visit.clientId,

      cobrador: visit.staffId,

      motivo: visit.reason,

      intento: visit.attemptNumber,

      reprogramada: visit.rescheduledDate ?? "",

      fecha: visit.createdAt,
    }));

    return buildPdfTable("Visitas de Cobranza Fallidas", rows, [
      {
        header: "Cliente",
        key: "cliente",
        width: 180,
      },
      {
        header: "Cobrador",
        key: "cobrador",
        width: 180,
      },
      {
        header: "Motivo",
        key: "motivo",
        width: 140,
      },
      {
        header: "Intento",
        key: "intento",
        width: 60,
      },
      {
        header: "Reprogramada",
        key: "reprogramada",
        width: 100,
      },
      {
        header: "Fecha",
        key: "fecha",
        width: 140,
      },
    ]);
  }

  // ─── SPRINT 05 · FINANCIERO ───────────────────────────────────────────────

  async cashboxClosurePdf(cashboxId: string): Promise<Buffer> {
    const cashbox = await this.cashboxService.findById(cashboxId);

    const balance = await this.cashboxService.getBalance(cashboxId);

    return buildPdfTable(
      `Cierre de Caja — ${new Date(cashbox.openingDate).toLocaleDateString(
        "es-AR",
      )}`,
      [
        {
          concepto: "Saldo de apertura",

          valor: balance.openingBalance,
        },
        {
          concepto: "Saldo calculado por el sistema",

          valor: balance.systemBalance,
        },
        {
          concepto: "Saldo declarado al cierre",

          valor: balance.declaredClosingBalance ?? "Pendiente",
        },
        {
          concepto: "Estado",

          valor: cashbox.status,
        },
      ],
      [
        {
          header: "Concepto",
          key: "concepto",
          width: 300,
        },
        {
          header: "Valor",
          key: "valor",
          width: 200,
        },
      ],
    );
  }

  async cashMovementsExcel(
    societyId: string,
    from?: string,
    to?: string,
  ): Promise<Buffer> {
    const movements = await this.cashMovementsService.findBySociety(
      societyId,
      from,
      to,
    );

    const rows = movements.map((movement) => ({
      fecha: movement.createdAt,

      tipo: movement.type,

      concepto: movement.concept,

      monto: Number(movement.amount),

      caja: movement.cashboxId,
    }));

    return buildExcelTable("Movimientos de Caja", rows, [
      {
        header: "Fecha",
        key: "fecha",
        width: 22,
      },
      {
        header: "Tipo",
        key: "tipo",
        width: 15,
      },
      {
        header: "Concepto",
        key: "concepto",
        width: 40,
      },
      {
        header: "Monto",
        key: "monto",
        width: 15,
      },
      {
        header: "Caja",
        key: "caja",
        width: 36,
      },
    ]);
  }

  async supplierPaymentsExcel(
    societyId: string,
    from?: string,
    to?: string,
  ): Promise<Buffer> {
    const payments = await this.supplierPaymentsService.findBySociety(
      societyId,
      from,
      to,
    );

    const rows = payments.map((payment) => ({
      fecha: payment.paymentDate,

      proveedor: payment.supplierId,

      monto: Number(payment.amount),

      metodo: payment.method,

      notas: payment.notes ?? "",
    }));

    return buildExcelTable("Pagos a Proveedores", rows, [
      {
        header: "Fecha",
        key: "fecha",
        width: 22,
      },
      {
        header: "Proveedor",
        key: "proveedor",
        width: 36,
      },
      {
        header: "Monto",
        key: "monto",
        width: 15,
      },
      {
        header: "Método",
        key: "metodo",
        width: 15,
      },
      {
        header: "Notas",
        key: "notas",
        width: 40,
      },
    ]);
  }

  receiptPdf(receiptId: string): Promise<Buffer> {
    return this.receiptsService.generatePdf(receiptId);
  }
}
