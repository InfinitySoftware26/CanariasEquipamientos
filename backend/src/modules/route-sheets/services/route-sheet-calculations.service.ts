import { Injectable } from "@nestjs/common";
import { InstallmentStatus } from "../../../common/enums/installment-status.enum";
import { Installment } from "../../installments/entities/installment.entity";
import { InstallmentsService } from "../../installments/services/installments.service";

@Injectable()
export class RouteSheetCalculationsService {
  constructor(private readonly installmentsService: InstallmentsService) {}

  // ============================================================
  // CALCULAR / ACTUALIZAR MORA
  // ============================================================

  async refreshLateInterest(installment: Installment, routeDate: string) {
    /**
     * La mora tiene una única fuente de verdad: InstallmentsService.
     *
     * RouteSheetCalculationsService no recalcula desde cero para no restaurar
     * mora ya pagada ni pisar ajustes manuales.
     */
    const referenceDate = this.parseDate(routeDate);

    await this.installmentsService.calculateLateInterest(
      installment.installmentId,
      referenceDate,
    );

    const refreshed = await this.installmentsService.findById(
      installment.installmentId,
    );

    const remainingAmount = Number(refreshed.remainingAmount ?? 0);

    const lateInterestAmount = Number(refreshed.lateInterestAmount ?? 0);

    const daysLate = this.calculateDaysLate(refreshed.dueDate, routeDate);

    installment.status = refreshed.status;
    installment.remainingAmount = refreshed.remainingAmount;
    installment.lateInterestAmount = refreshed.lateInterestAmount;
    installment.lateInterestCalculatedAt = refreshed.lateInterestCalculatedAt;

    return {
      daysLate,

      lateInterestAmount: this.roundMoney(lateInterestAmount),

      totalToCollect: this.roundMoney(remainingAmount + lateInterestAmount),
    };
  }

  // ============================================================
  // ESTADO VISUAL DE CUOTA
  // ============================================================

  getCollectionState(
    installment: Installment,
    routeDate: string | Date,
  ): "overdue" | "due_today" | "partial" | "pending" {
    if (installment.status === InstallmentStatus.PARTIAL) {
      return "partial";
    }

    const dueDate = this.formatDate(installment.dueDate);

    const currentDate = this.formatDate(routeDate);

    if (dueDate < currentDate) {
      return "overdue";
    }

    if (dueDate === currentDate) {
      return "due_today";
    }

    return "pending";
  }

  // ============================================================
  // DÍAS DE ATRASO
  // ============================================================

  calculateDaysLate(
    dueDate: string | Date,
    referenceDate: string | Date,
  ): number {
    const due = this.parseDate(this.formatDate(dueDate));

    const reference = this.parseDate(this.formatDate(referenceDate));

    const difference = reference.getTime() - due.getTime();

    if (difference <= 0) {
      return 0;
    }

    return Math.floor(difference / (1000 * 60 * 60 * 24));
  }

  // ============================================================
  // HELPERS DE FECHA
  // ============================================================

  parseDate(value: string | Date): Date {
    if (value instanceof Date) {
      return new Date(
        value.getFullYear(),
        value.getMonth(),
        value.getDate(),
        0,
        0,
        0,
        0,
      );
    }

    const [year, month, day] = value.slice(0, 10).split("-").map(Number);

    return new Date(year, month - 1, day, 0, 0, 0, 0);
  }

  formatDate(value: string | Date): string {
    if (typeof value === "string") {
      return value.slice(0, 10);
    }

    const year = value.getFullYear();

    const month = String(value.getMonth() + 1).padStart(2, "0");

    const day = String(value.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  // ============================================================
  // DINERO
  // ============================================================

  roundMoney(value: number): number {
    return Math.round(value * 100) / 100;
  }
}
