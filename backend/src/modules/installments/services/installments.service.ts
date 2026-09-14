import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";

import { InjectRepository } from "@nestjs/typeorm";

import { DataSource, Repository } from "typeorm";

import { randomUUID } from "crypto";

import {
  IInstallmentsRepository,
  INSTALLMENTS_REPOSITORY,
} from "../interfaces/installments-repository.interface";

import { Installment } from "../entities/installment.entity";

import { RefinanceInstallmentsDto } from "../dto/refinance-installments.dto";

import { InstallmentStatus } from "../../../common/enums/installment-status.enum";

import { PaymentFrequency } from "../../../common/enums/payment-frequency.enum";

@Injectable()
export class InstallmentsService {
  constructor(
    @Inject(INSTALLMENTS_REPOSITORY)
    private readonly installmentsRepo: IInstallmentsRepository,

    @InjectRepository(Installment)
    private readonly installmentEntityRepo: Repository<Installment>,

    private readonly dataSource: DataSource,
  ) {}

  // ─────────────────────────────────────────────
  // CONSULTAS
  // ─────────────────────────────────────────────

  findBySale(saleId: string): Promise<Installment[]> {
    return this.installmentsRepo.findBySale(saleId);
  }

  findByClient(clientId: string, societyId: string): Promise<Installment[]> {
    return this.installmentsRepo.findByClient(clientId, societyId);
  }

  async findOverdue(societyId: string): Promise<Installment[]> {
    /*
     * Antes de consultar actualizamos
     * las cuotas cuyo vencimiento ya pasó.
     */
    await this.updateOverdueInstallments(societyId);

    let overdue = await this.installmentsRepo.findOverdue(societyId);

    /*
     * Recalculamos mora de todas
     * las cuotas vencidas.
     */
    for (const installment of overdue) {
      await this.calculateLateInterest(installment.installmentId);
    }

    /*
     * Las volvemos a buscar para devolver
     * lateInterestAmount actualizado.
     */
    overdue = await this.installmentsRepo.findOverdue(societyId);

    return overdue;
  }

  async findPendingBySociety(societyId: string): Promise<Installment[]> {
    await this.updateOverdueInstallments(societyId);

    return this.installmentsRepo.findPendingBySociety(societyId);
  }

  async findById(id: string): Promise<Installment> {
    const installment = await this.installmentsRepo.findById(id);

    if (!installment) {
      throw new NotFoundException(`Cuota ${id} no encontrada`);
    }

    return installment;
  }

  // ─────────────────────────────────────────────
  // ACTUALIZAR CUOTAS VENCIDAS
  // ─────────────────────────────────────────────

  async updateOverdueInstallments(
    societyId: string,
    referenceDate = new Date(),
  ): Promise<number> {
    const installments = await this.installmentEntityRepo.find({
      where: {
        societyId,
      },

      order: {
        dueDate: "ASC",
      },
    });

    const today = this.normalizeDate(referenceDate);

    let updatedCount = 0;

    for (const installment of installments) {
      /*
       * Una cuota refinanciada ya no forma
       * parte del calendario activo.
       */
      if (installment.isRefinanced) {
        continue;
      }

      if (installment.status === InstallmentStatus.PAID) {
        continue;
      }

      /*
       * Solo modificamos cuotas pendientes
       * o con pagos parciales.
       */
      if (
        installment.status !== InstallmentStatus.PENDING &&
        installment.status !== InstallmentStatus.PARTIAL
      ) {
        continue;
      }

      const dueDate = this.parseDate(installment.dueDate);

      if (dueDate.getTime() < today.getTime()) {
        await this.installmentEntityRepo.update(
          {
            installmentId: installment.installmentId,
          },
          {
            status: InstallmentStatus.OVERDUE,
          },
        );

        updatedCount++;
      }
    }

    return updatedCount;
  }

  // ─────────────────────────────────────────────
  // PAGAR CUOTA
  // ─────────────────────────────────────────────

  async payInstallment(id: string, amount: number): Promise<void> {
    const installment = await this.findById(id);

    if (installment.isRefinanced) {
      throw new BadRequestException(
        "Esta cuota fue refinanciada y ya no admite pagos",
      );
    }

    if (installment.status === InstallmentStatus.PAID) {
      throw new BadRequestException("La cuota ya se encuentra pagada");
    }

    if (amount <= 0) {
      throw new BadRequestException("El monto debe ser mayor a cero");
    }

    const currentPaid = Number(installment.paidAmount);

    const installmentAmount = Number(installment.amount);

    const remainingAmount = Number(installment.remainingAmount);

    /*
     * Por ahora no permitimos que un pago
     * exceda el saldo de una cuota.
     *
     * El adelanto de cuotas será un flujo
     * separado si luego lo necesitan.
     */
    if (amount > remainingAmount) {
      throw new BadRequestException(
        `El pago supera el saldo pendiente de la cuota. Saldo actual: ${remainingAmount}`,
      );
    }

    const totalPaid = Math.round((currentPaid + amount) * 100) / 100;

    const newStatus =
      totalPaid >= installmentAmount
        ? InstallmentStatus.PAID
        : InstallmentStatus.PARTIAL;

    await this.installmentsRepo.updateStatus(id, newStatus, totalPaid);

    /*
     * Si la cuota quedó pagada limpiamos
     * el interés pendiente.
     */
    if (newStatus === InstallmentStatus.PAID) {
      await this.installmentEntityRepo.update(
        {
          installmentId: id,
        },
        {
          lateInterestAmount: 0,
        },
      );
    }
  }

  // ─────────────────────────────────────────────
  // MODIFICAR VENCIMIENTO
  // ─────────────────────────────────────────────

  async updateDueDate(id: string, dueDate: string): Promise<void> {
    const installment = await this.findById(id);

    if (installment.status === InstallmentStatus.PAID) {
      throw new BadRequestException(
        "No se puede modificar la fecha de una cuota pagada",
      );
    }

    if (installment.isRefinanced) {
      throw new BadRequestException(
        "No se puede modificar una cuota refinanciada",
      );
    }

    const parsedDate = this.parseDate(dueDate);

    /*
     * Recalculamos el estado teniendo
     * en cuenta la nueva fecha.
     */
    const today = this.normalizeDate(new Date());

    let status = installment.status;

    if (parsedDate.getTime() < today.getTime()) {
      status = InstallmentStatus.OVERDUE;
    } else if (Number(installment.paidAmount) > 0) {
      status = InstallmentStatus.PARTIAL;
    } else {
      status = InstallmentStatus.PENDING;
    }

    await this.installmentEntityRepo.update(
      {
        installmentId: id,
      },
      {
        dueDate: parsedDate,

        status,

        /*
         * Como cambió el vencimiento,
         * la mora previa deja de ser válida.
         */
        lateInterestAmount: 0,

        lateInterestCalculatedAt: null,
      },
    );
  }

  // ─────────────────────────────────────────────
  // MODIFICAR INTERÉS DIARIO
  // ─────────────────────────────────────────────

  async updateLateInterestRate(id: string, rate: number): Promise<void> {
    const installment = await this.findById(id);

    if (installment.isRefinanced) {
      throw new BadRequestException(
        "No se puede modificar una cuota refinanciada",
      );
    }

    if (rate < 0 || rate > 1) {
      throw new BadRequestException("El interés diario debe estar entre 0 y 1");
    }

    await this.installmentEntityRepo.update(
      {
        installmentId: id,
      },
      {
        dailyLateInterestRate: rate,
      },
    );

    /*
     * Recalculamos inmediatamente.
     */
    await this.calculateLateInterest(id);
  }

  // ─────────────────────────────────────────────
  // CALCULAR MORA
  // ─────────────────────────────────────────────

  async calculateLateInterest(
    id: string,
    referenceDate = new Date(),
  ): Promise<number> {
    const installment = await this.findById(id);

    if (
      installment.status === InstallmentStatus.PAID ||
      installment.isRefinanced
    ) {
      return 0;
    }

    const dueDate = this.parseDate(installment.dueDate);

    const today = this.normalizeDate(referenceDate);

    /*
     * La cuota todavía no venció.
     */
    if (today.getTime() <= dueDate.getTime()) {
      await this.installmentEntityRepo.update(
        {
          installmentId: id,
        },
        {
          lateInterestAmount: 0,

          lateInterestCalculatedAt: today,
        },
      );

      return 0;
    }

    const differenceMs = today.getTime() - dueDate.getTime();

    const daysLate = Math.floor(differenceMs / (1000 * 60 * 60 * 24));

    const rate = Number(installment.dailyLateInterestRate ?? 0);

    const remainingAmount = Number(installment.remainingAmount);

    /*
     * Interés simple:
     *
     * saldo pendiente
     * × tasa diaria
     * × días vencidos
     */
    const interest = Math.round(remainingAmount * rate * daysLate * 100) / 100;

    await this.installmentEntityRepo.update(
      {
        installmentId: id,
      },
      {
        lateInterestAmount: interest,

        lateInterestCalculatedAt: today,
      },
    );

    return interest;
  }

  // ─────────────────────────────────────────────
  // REFINANCIACIÓN
  // ─────────────────────────────────────────────

  async refinance(
    saleId: string,
    dto: RefinanceInstallmentsDto,
    societyId: string,
  ) {
    /*
     * Antes de refinanciar actualizamos
     * vencimientos.
     */
    await this.updateOverdueInstallments(societyId);

    const installments = await this.installmentEntityRepo.find({
      where: {
        saleId,
        societyId,
      },

      order: {
        installmentNumber: "ASC",
      },
    });

    if (installments.length === 0) {
      throw new NotFoundException("La venta no tiene cuotas");
    }

    /*
     * Solo tomamos saldo activo.
     */
    const pending = installments.filter(
      (installment) =>
        !installment.isRefinanced &&
        installment.status !== InstallmentStatus.PAID &&
        Number(installment.remainingAmount) > 0,
    );

    if (pending.length === 0) {
      throw new BadRequestException(
        "La venta no tiene saldo pendiente para refinanciar",
      );
    }

    if (dto.installmentAmount <= 0) {
      throw new BadRequestException(
        "El monto acordado por cuota debe ser mayor a cero",
      );
    }

    // ─────────────────────────────────────────
    // TOTAL PENDIENTE
    // ─────────────────────────────────────────

    let totalPending = 0;

    for (const installment of pending) {
      const interest = await this.calculateLateInterest(
        installment.installmentId,
      );

      totalPending += Number(installment.remainingAmount) + interest;
    }

    totalPending = Math.round(totalPending * 100) / 100;

    if (totalPending <= 0) {
      throw new BadRequestException("No existe saldo para refinanciar");
    }

    /*
     * Ejemplo:
     *
     * deuda: 110.000
     * puede pagar: 30.000
     *
     * => 4 cuotas
     *
     * 30.000
     * 30.000
     * 30.000
     * 20.000
     */
    const installmentsCount = Math.ceil(totalPending / dto.installmentAmount);

    if (installmentsCount > 100) {
      throw new BadRequestException(
        "La refinanciación produciría más de 100 cuotas",
      );
    }

    const refinancingGroupId = randomUUID();

    const firstDueDate = this.parseDate(dto.firstDueDate);

    const clientId = pending[0].clientId;

    /*
     * No reutilizamos números anteriores.
     *
     * Si tenía cuotas 1..12,
     * refinanciación comienza en 13.
     */
    const firstInstallmentNumber =
      Math.max(
        ...installments.map((installment) => installment.installmentNumber),
      ) + 1;

    // ─────────────────────────────────────────
    // TRANSACCIÓN
    // ─────────────────────────────────────────

    await this.dataSource.transaction(async (manager) => {
      /*
       * Marcamos las cuotas originales
       * como refinanciadas.
       *
       * NO se eliminan.
       */
      for (const installment of pending) {
        await manager.update(
          Installment,

          {
            installmentId: installment.installmentId,
          },

          {
            isRefinanced: true,

            refinancedAt: new Date(),

            refinancingGroupId,

            notes: installment.notes
              ? `${installment.notes} | Refinanciada`
              : "Refinanciada",
          },
        );
      }

      let remaining = totalPending;

      let dueDate = new Date(firstDueDate);

      for (let index = 0; index < installmentsCount; index++) {
        const amount = Math.min(dto.installmentAmount, remaining);

        const roundedAmount = Math.round(amount * 100) / 100;

        const newInstallment = manager.create(Installment, {
          saleId,

          clientId,

          societyId,

          installmentNumber: firstInstallmentNumber + index,

          amount: roundedAmount,

          paidAmount: 0,

          remainingAmount: roundedAmount,

          dueDate: new Date(dueDate),

          paymentFrequency: dto.paymentFrequency,

          status: InstallmentStatus.PENDING,

          dailyLateInterestRate: 0,

          lateInterestAmount: 0,

          lateInterestCalculatedAt: null,

          isRefinanced: false,

          refinancedAt: null,

          refinancingGroupId,

          notes: "Cuota generada por refinanciación",
        });

        await manager.save(Installment, newInstallment);

        remaining = Math.round((remaining - roundedAmount) * 100) / 100;

        dueDate = this.getNextInstallmentDate(dueDate, dto.paymentFrequency);
      }
    });

    return {
      refinancingGroupId,

      previousInstallments: pending.length,

      totalPending,

      agreedInstallmentAmount: dto.installmentAmount,

      installmentsCount,

      firstDueDate: dto.firstDueDate,

      paymentFrequency: dto.paymentFrequency,
    };
  }

  // ─────────────────────────────────────────────
  // FECHA SIGUIENTE
  // ─────────────────────────────────────────────

  private getNextInstallmentDate(
    currentDate: Date,
    frequency: PaymentFrequency,
  ): Date {
    const next = new Date(currentDate);

    switch (frequency) {
      case PaymentFrequency.DAILY: {
        do {
          next.setDate(next.getDate() + 1);
        } while (next.getDay() === 0);

        return next;
      }

      case PaymentFrequency.WEEKLY: {
        next.setDate(next.getDate() + 7);

        return next;
      }

      case PaymentFrequency.BIWEEKLY: {
        next.setDate(next.getDate() + 14);

        return next;
      }

      case PaymentFrequency.MONTHLY: {
        return this.addOneMonth(next);
      }

      default:
        return next;
    }
  }

  // ─────────────────────────────────────────────
  // SUMAR UN MES CALENDARIO
  // ─────────────────────────────────────────────

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

  // ─────────────────────────────────────────────
  // PARSEAR FECHA
  // ─────────────────────────────────────────────

  private parseDate(value: string | Date): Date {
    if (value instanceof Date) {
      return this.normalizeDate(value);
    }

    const datePart = String(value).slice(0, 10);

    const date = new Date(`${datePart}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
      throw new BadRequestException(`Fecha inválida: ${value}`);
    }

    return date;
  }

  private normalizeDate(value: Date): Date {
    return new Date(value.getFullYear(), value.getMonth(), value.getDate());
  }
}
