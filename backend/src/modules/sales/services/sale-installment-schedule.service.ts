import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import {
  ISalesRepository,
  SALES_REPOSITORY,
} from "../interfaces/sales-repository.interface";

import { Sale } from "../entities/sale.entity";
import { Installment } from "../../installments/entities/installment.entity";

import { PaymentFrequency } from "../../../common/enums/payment-frequency.enum";
import { InstallmentStatus } from "../../../common/enums/installment-status.enum";
import { CollectionScheduleType } from "../../../common/enums/collection-schedule-type.enum";

@Injectable()
export class SaleInstallmentScheduleService {
  constructor(
    @Inject(SALES_REPOSITORY)
    private readonly salesRepo: ISalesRepository,

    @InjectRepository(Installment)
    private readonly installmentRepo: Repository<Installment>,
  ) {}

  // ─────────────────────────────────────────────────────────────
  // GENERACIÓN DE CUOTAS
  // ─────────────────────────────────────────────────────────────

  async generateInstallments(sale: Sale, deliveryDate: string): Promise<void> {
    if (!deliveryDate) {
      return;
    }

    const existingInstallments = await this.installmentRepo.find({
      where: {
        saleId: sale.saleId,
      },

      order: {
        installmentNumber: "ASC",
      },
    });

    /*
     * Una vez que existe un pago,
     * el calendario no se regenera.
     *
     * Esto protege la historia contable.
     */
    const hasPayment = existingInstallments.some(
      (installment) =>
        Number(installment.paidAmount) > 0 ||
        installment.status === InstallmentStatus.PAID,
    );

    if (hasPayment) {
      return;
    }

    /*
     * Si las cuotas todavía no tienen pagos,
     * podemos regenerarlas porque el admin
     * todavía está configurando fechas.
     */
    if (existingInstallments.length > 0) {
      await this.installmentRepo.delete({
        saleId: sale.saleId,
      });
    }

    const firstDueDate = this.resolveFirstDueDate(sale, deliveryDate);

    const secondDueDate = this.resolveSecondDueDate(sale, firstDueDate);

    const installments: Partial<Installment>[] = [];

    for (let number = 1; number <= sale.installmentsCount; number++) {
      let dueDate: Date;

      // CUOTA 1
      if (number === 1) {
        dueDate = new Date(firstDueDate);
      }

      // CUOTA 2
      else if (number === 2) {
        dueDate = new Date(secondDueDate);
      }

      // CUOTA 3 EN ADELANTE
      else {
        const previousDueDate = installments[installments.length - 1].dueDate;

        if (!previousDueDate) {
          throw new BadRequestException(
            "No se pudo determinar la fecha de la cuota anterior",
          );
        }

        dueDate = this.getNextInstallmentDate(
          new Date(previousDueDate),
          sale.paymentFrequency,
        );
      }

      installments.push({
        saleId: sale.saleId,

        clientId: sale.clientId,

        societyId: sale.societyId,

        installmentNumber: number,

        amount: sale.installmentAmount,

        paidAmount: 0,

        remainingAmount: sale.installmentAmount,

        dueDate: new Date(dueDate),

        paymentFrequency: sale.paymentFrequency,

        dailyLateInterestRate: Number(sale.dailyLateInterestRate ?? 0),

        status: InstallmentStatus.PENDING,
      });
    }

    const entities = installments.map((installment) =>
      this.installmentRepo.create(installment),
    );

    await this.installmentRepo.save(entities);
  }

  // ─────────────────────────────────────────────────────────────
  // REPROGRAMAR CUOTAS FUTURAS
  // ─────────────────────────────────────────────────────────────

  async rescheduleFutureInstallments(sale: Sale): Promise<void> {
    const installments = await this.installmentRepo.find({
      where: {
        saleId: sale.saleId,
      },

      order: {
        installmentNumber: "ASC",
      },
    });

    if (installments.length <= 1) {
      return;
    }

    const firstInstallment = installments.find(
      (installment) => Number(installment.installmentNumber) === 1,
    );

    if (!firstInstallment) {
      throw new BadRequestException(
        "No se encontró la primera cuota de la venta",
      );
    }

    const futureInstallments = installments.filter(
      (installment) => Number(installment.installmentNumber) >= 2,
    );

    /*
     * No modificamos cuotas 2+ que ya tengan
     * movimientos financieros.
     */
    const hasFuturePayments = futureInstallments.some(
      (installment) =>
        Number(installment.paidAmount ?? 0) > 0 ||
        installment.status === InstallmentStatus.PAID ||
        installment.status === InstallmentStatus.PARTIAL,
    );

    if (hasFuturePayments) {
      throw new BadRequestException(
        "No se puede cambiar la programación porque existen cuotas futuras con pagos registrados",
      );
    }

    let secondDueDate: Date;

    /*
     * Prioridad 1:
     * fecha explícita para cuota 2.
     */
    if (sale.secondDueDate) {
      secondDueDate = this.parseDate(sale.secondDueDate);
    } else if (
      /*
       * Prioridad 2:
       * rango mensual + fecha concreta coordinada.
       */
      sale.collectionScheduleType === CollectionScheduleType.MONTHLY_RANGE &&
      sale.manualCollectionDate
    ) {
      secondDueDate = this.parseDate(sale.manualCollectionDate);
    } else if (
      /*
       * Prioridad 3:
       * próximo día fijo acordado.
       */
      sale.collectionScheduleType === CollectionScheduleType.FIXED_WEEKDAY &&
      sale.collectionWeekday !== null &&
      sale.collectionWeekday !== undefined
    ) {
      const firstDueDate = this.parseDate(firstInstallment.dueDate);

      const today = this.normalizeDate(new Date());

      const baseDate =
        today.getTime() > firstDueDate.getTime() ? today : firstDueDate;

      secondDueDate = this.getNextWeekday(baseDate, sale.collectionWeekday);
    } else {
      /*
       * Fallback:
       * frecuencia normal del plan.
       */
      secondDueDate = this.getNextInstallmentDate(
        this.parseDate(firstInstallment.dueDate),
        sale.paymentFrequency,
      );
    }

    let currentDueDate = new Date(secondDueDate);

    for (const installment of futureInstallments) {
      const installmentNumber = Number(installment.installmentNumber);

      if (installmentNumber === 2) {
        currentDueDate = new Date(secondDueDate);
      } else {
        currentDueDate = this.getNextInstallmentDate(
          currentDueDate,
          sale.paymentFrequency,
        );
      }

      await this.installmentRepo.update(
        {
          installmentId: installment.installmentId,
        },
        {
          dueDate: new Date(currentDueDate),

          dailyLateInterestRate: Number(sale.dailyLateInterestRate ?? 0),

          lateInterestAmount: 0,

          lateInterestCalculatedAt: null,

          status: InstallmentStatus.PENDING,
        },
      );
    }

    await this.salesRepo.update(sale.saleId, {
      secondDueDate: new Date(secondDueDate),
    });
  }

  // ─────────────────────────────────────────────────────────────
  // FECHA PRIMERA CUOTA
  // ─────────────────────────────────────────────────────────────

  private resolveFirstDueDate(sale: Sale, deliveryDate: string): Date {
    /*
     * Caso:
     * entregar producto + cobrar primera cuota.
     */
    if (sale.firstInstallmentOnDelivery !== false) {
      return this.parseDate(deliveryDate);
    }

    /*
     * Primera cuota configurada
     * manualmente.
     */
    if (sale.firstDueDate) {
      return this.parseDate(sale.firstDueDate);
    }

    /*
     * Si por datos viejos no existe firstDueDate
     * pero sí secondDueDate, evitamos romper el
     * flujo.
     */
    if (sale.secondDueDate) {
      return this.parseDate(sale.secondDueDate);
    }

    return this.parseDate(deliveryDate);
  }

  // ─────────────────────────────────────────────────────────────
  // FECHA SEGUNDA CUOTA
  // ─────────────────────────────────────────────────────────────

  private resolveSecondDueDate(sale: Sale, firstDueDate: Date): Date {
    /*
     * Prioridad 1:
     * fecha de segunda cuota cargada manualmente.
     */
    if (sale.secondDueDate) {
      const second = this.parseDate(sale.secondDueDate);

      if (second.getTime() < firstDueDate.getTime()) {
        throw new BadRequestException(
          "La segunda cuota no puede vencer antes que la primera",
        );
      }

      return second;
    }

    /*
     * Prioridad 2:
     * fecha puntual acordada dentro
     * de un rango mensual.
     */
    if (
      sale.collectionScheduleType === CollectionScheduleType.MONTHLY_RANGE &&
      sale.manualCollectionDate
    ) {
      const manualDate = this.parseDate(sale.manualCollectionDate);

      if (manualDate.getTime() > firstDueDate.getTime()) {
        return manualDate;
      }
    }

    /*
     * Prioridad 3:
     * día fijo de cobranza.
     *
     * Buscamos el próximo día acordado.
     */
    if (
      sale.collectionScheduleType === CollectionScheduleType.FIXED_WEEKDAY &&
      sale.collectionWeekday !== null &&
      sale.collectionWeekday !== undefined
    ) {
      return this.getNextWeekday(firstDueDate, sale.collectionWeekday);
    }

    /*
     * Sin configuración especial:
     * usamos la frecuencia normal.
     */
    return this.getNextInstallmentDate(firstDueDate, sale.paymentFrequency);
  }

  // ─────────────────────────────────────────────────────────────
  // FECHAS
  // ─────────────────────────────────────────────────────────────

  private getNextWeekday(fromDate: Date, weekday: number): Date {
    const date = new Date(fromDate);

    let daysToAdd = (weekday - date.getDay() + 7) % 7;

    /*
     * Si coincide con el mismo día,
     * buscamos la semana siguiente.
     */
    if (daysToAdd === 0) {
      daysToAdd = 7;
    }

    date.setDate(date.getDate() + daysToAdd);

    return date;
  }

  getNextInstallmentDate(currentDate: Date, frequency: PaymentFrequency): Date {
    const nextDate = new Date(currentDate);

    switch (frequency) {
      case PaymentFrequency.DAILY: {
        do {
          nextDate.setDate(nextDate.getDate() + 1);
        } while (nextDate.getDay() === 0);

        return nextDate;
      }

      case PaymentFrequency.BIWEEKLY: {
        nextDate.setDate(nextDate.getDate() + 14);

        return nextDate;
      }

      case PaymentFrequency.WEEKLY: {
        nextDate.setDate(nextDate.getDate() + 7);

        return nextDate;
      }

      case PaymentFrequency.MONTHLY: {
        return this.addOneMonth(nextDate);
      }

      default:
        return nextDate;
    }
  }

  /**
   * Suma un mes calendario sin usar "+28 días".
   * También evita problemas con día 31.
   */
  private addOneMonth(date: Date): Date {
    const originalDay = date.getDate();

    const result = new Date(date);

    result.setDate(1);

    result.setMonth(result.getMonth() + 1);

    const lastDayOfTargetMonth = new Date(
      result.getFullYear(),
      result.getMonth() + 1,
      0,
    ).getDate();

    result.setDate(Math.min(originalDay, lastDayOfTargetMonth));

    return result;
  }

  parseDate(value: Date | string): Date {
    if (value instanceof Date) {
      return new Date(value.getFullYear(), value.getMonth(), value.getDate());
    }

    const datePart = String(value).slice(0, 10);

    const date = new Date(`${datePart}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
      throw new BadRequestException(`Fecha inválida: ${value}`);
    }

    return date;
  }

  private normalizeDate(value: Date): Date {
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
}
