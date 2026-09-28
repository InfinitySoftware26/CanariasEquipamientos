import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
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

import { UpdateLateInterestDto } from "../dto/update-late-interest.dto";

import { InstallmentStatus } from "../../../common/enums/installment-status.enum";

import { PaymentFrequency } from "../../../common/enums/payment-frequency.enum";

export interface InstallmentPaymentResult {
  installmentId: string;

  receivedAmount: number;

  appliedToLateInterest: number;

  appliedToCapital: number;

  remainingLateInterest: number;

  remainingCapital: number;

  status: InstallmentStatus;
}

@Injectable()
export class InstallmentsService {
  constructor(
    @Inject(INSTALLMENTS_REPOSITORY)
    private readonly installmentsRepo: IInstallmentsRepository,

    @InjectRepository(Installment)
    private readonly installmentEntityRepo: Repository<Installment>,

    private readonly dataSource: DataSource,
  ) {}

  // ============================================================
  // CONSULTAS
  // ============================================================

  async findBySale(saleId: string): Promise<Installment[]> {
    let installments = await this.installmentsRepo.findBySale(saleId);

    for (const installment of installments) {
      await this.refreshIfNecessary(installment);
    }

    installments = await this.installmentsRepo.findBySale(saleId);

    return installments;
  }

  async findByClient(
    clientId: string,
    societyId: string,
  ): Promise<Installment[]> {
    await this.updateOverdueInstallments(societyId);

    let installments = await this.installmentsRepo.findByClient(
      clientId,
      societyId,
    );

    for (const installment of installments) {
      await this.refreshIfNecessary(installment);
    }

    installments = await this.installmentsRepo.findByClient(
      clientId,
      societyId,
    );

    return installments;
  }

  async findOverdue(societyId: string): Promise<Installment[]> {
    await this.updateOverdueInstallments(societyId);

    let overdue = await this.installmentsRepo.findOverdue(societyId);

    for (const installment of overdue) {
      await this.calculateLateInterest(installment.installmentId);
    }

    overdue = await this.installmentsRepo.findOverdue(societyId);

    return overdue;
  }

  async findPendingBySociety(societyId: string): Promise<Installment[]> {
    await this.updateOverdueInstallments(societyId);

    let installments =
      await this.installmentsRepo.findPendingBySociety(societyId);

    for (const installment of installments) {
      await this.refreshIfNecessary(installment);
    }

    installments = await this.installmentsRepo.findPendingBySociety(societyId);

    return installments;
  }

  async findById(id: string): Promise<Installment> {
    const installment = await this.installmentsRepo.findById(id);

    if (!installment) {
      throw new NotFoundException(`Cuota ${id} no encontrada`);
    }

    return installment;
  }

  // ============================================================
  // TOTAL ACTUAL A COBRAR
  // ============================================================

  async getTotalToCollect(
    id: string,
    referenceDate = new Date(),
  ): Promise<{
    remainingAmount: number;
    lateInterestAmount: number;
    totalToCollect: number;
  }> {
    await this.calculateLateInterest(id, referenceDate);

    const installment = await this.findById(id);

    const remainingAmount = this.roundMoney(
      Number(installment.remainingAmount ?? 0),
    );

    const lateInterestAmount = this.roundMoney(
      Number(installment.lateInterestAmount ?? 0),
    );

    return {
      remainingAmount,

      lateInterestAmount,

      totalToCollect: this.roundMoney(remainingAmount + lateInterestAmount),
    };
  }

  // ============================================================
  // ACTUALIZAR CUOTAS VENCIDAS
  // ============================================================

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
      if (installment.isRefinanced) {
        continue;
      }

      if (installment.status === InstallmentStatus.PAID) {
        continue;
      }

      if (
        installment.status !== InstallmentStatus.PENDING &&
        installment.status !== InstallmentStatus.PARTIAL &&
        installment.status !== InstallmentStatus.OVERDUE
      ) {
        continue;
      }

      const dueDate = this.parseDate(installment.dueDate);

      if (dueDate.getTime() < today.getTime()) {
        if (installment.status !== InstallmentStatus.OVERDUE) {
          await this.installmentsRepo.update(installment.installmentId, {
            status: InstallmentStatus.OVERDUE,
          });

          updatedCount++;
        }

        await this.calculateLateInterest(installment.installmentId, today);
      }
    }

    return updatedCount;
  }

  // ============================================================
  // PAGAR CUOTA
  //
  // PRIORIDAD:
  // 1. MORA
  // 2. CAPITAL
  // ============================================================

  async payInstallment(
    id: string,
    amount: number,
  ): Promise<InstallmentPaymentResult> {
    let installment = await this.findById(id);

    if (installment.isRefinanced) {
      throw new BadRequestException(
        "Esta cuota fue refinanciada y ya no admite pagos",
      );
    }

    if (installment.status === InstallmentStatus.PAID) {
      throw new BadRequestException("La cuota ya se encuentra pagada");
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      throw new BadRequestException("El monto debe ser mayor a cero");
    }

    /*
     * Primero llevamos la mora
     * hasta el momento actual.
     */
    await this.calculateLateInterest(id);

    installment = await this.findById(id);

    const currentPaid = Number(installment.paidAmount ?? 0);

    const installmentAmount = Number(installment.amount ?? 0);

    const remainingCapital = Number(installment.remainingAmount ?? 0);

    const currentLateInterest = Number(installment.lateInterestAmount ?? 0);

    const totalPending = this.roundMoney(
      remainingCapital + currentLateInterest,
    );

    const normalizedAmount = this.roundMoney(amount);

    if (normalizedAmount > totalPending) {
      throw new BadRequestException(
        `El pago supera el total pendiente. Capital: ${this.roundMoney(
          remainingCapital,
        )}. Mora: ${this.roundMoney(
          currentLateInterest,
        )}. Total: ${totalPending}`,
      );
    }

    // ----------------------------------------------------------
    // PRIMERO MORA
    // ----------------------------------------------------------

    const appliedToLateInterest = this.roundMoney(
      Math.min(normalizedAmount, currentLateInterest),
    );

    let amountRemaining = this.roundMoney(
      normalizedAmount - appliedToLateInterest,
    );

    const newLateInterest = this.roundMoney(
      Math.max(currentLateInterest - appliedToLateInterest, 0),
    );

    // ----------------------------------------------------------
    // DESPUÉS CAPITAL
    // ----------------------------------------------------------

    const appliedToCapital = this.roundMoney(
      Math.min(amountRemaining, remainingCapital),
    );

    amountRemaining = this.roundMoney(amountRemaining - appliedToCapital);

    if (amountRemaining > 0) {
      throw new BadRequestException("No se pudo imputar completamente el pago");
    }

    const newPaidAmount = this.roundMoney(
      Math.min(currentPaid + appliedToCapital, installmentAmount),
    );

    const newRemainingCapital = this.roundMoney(
      Math.max(installmentAmount - newPaidAmount, 0),
    );

    const today = this.normalizeDate(new Date());

    const dueDate = this.parseDate(installment.dueDate);

    let newStatus: InstallmentStatus;

    if (newRemainingCapital <= 0 && newLateInterest <= 0) {
      newStatus = InstallmentStatus.PAID;
    } else if (today.getTime() > dueDate.getTime()) {
      newStatus = InstallmentStatus.OVERDUE;
    } else if (newPaidAmount > 0) {
      newStatus = InstallmentStatus.PARTIAL;
    } else {
      newStatus = InstallmentStatus.PENDING;
    }

    await this.installmentsRepo.update(id, {
      paidAmount: newPaidAmount,

      remainingAmount: newRemainingCapital,

      lateInterestAmount: newLateInterest,

      /*
       * El cálculo queda cerrado al día del pago.
       *
       * La próxima vez sólo se genera mora
       * desde este punto.
       */
      lateInterestCalculatedAt: today,

      status: newStatus,
    });

    return {
      installmentId: id,

      receivedAmount: normalizedAmount,

      appliedToLateInterest,

      appliedToCapital,

      remainingLateInterest: newLateInterest,

      remainingCapital: newRemainingCapital,

      status: newStatus,
    };
  }

  // ============================================================
  // MODIFICAR VENCIMIENTO
  // ============================================================

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

    const today = this.normalizeDate(new Date());

    let status = installment.status;

    if (parsedDate.getTime() < today.getTime()) {
      status = InstallmentStatus.OVERDUE;
    } else if (Number(installment.paidAmount) > 0) {
      status = InstallmentStatus.PARTIAL;
    } else {
      status = InstallmentStatus.PENDING;
    }

    await this.installmentsRepo.update(id, {
      dueDate: parsedDate,

      status,

      /*
       * Al cambiar el vencimiento,
       * reiniciamos la mora.
       */
      lateInterestAmount: 0,

      lateInterestCalculatedAt: null,
    });

    if (status === InstallmentStatus.OVERDUE) {
      await this.calculateLateInterest(id);
    }
  }

  // ============================================================
  // AJUSTAR MORA MANUALMENTE
  // ============================================================

  async updateLateInterest(
    id: string,
    dto: UpdateLateInterestDto,
  ): Promise<void> {
    let installment = await this.findById(id);

    if (installment.isRefinanced) {
      throw new BadRequestException(
        "No se puede modificar una cuota refinanciada",
      );
    }

    if (installment.status === InstallmentStatus.PAID) {
      throw new BadRequestException(
        "No se puede modificar la mora de una cuota pagada",
      );
    }

    if (
      dto.dailyLateInterestRate === undefined &&
      dto.lateInterestAmount === undefined
    ) {
      throw new BadRequestException(
        "Debe indicar una tasa diaria, un monto de mora o ambos",
      );
    }

    /*
     * Antes de cambiar la tasa cerramos
     * el cálculo con la tasa anterior.
     *
     * Así la nueva tasa empieza a correr
     * desde hoy y no modifica retroactivamente
     * días anteriores.
     */
    if (dto.dailyLateInterestRate !== undefined) {
      await this.calculateLateInterest(id);

      installment = await this.findById(id);
    }

    const updates: Partial<Installment> = {};

    if (dto.dailyLateInterestRate !== undefined) {
      updates.dailyLateInterestRate = dto.dailyLateInterestRate;

      updates.lateInterestCalculatedAt = this.normalizeDate(new Date());
    }

    if (dto.lateInterestAmount !== undefined) {
      updates.lateInterestAmount = this.roundMoney(dto.lateInterestAmount);

      /*
       * El importe manual se considera
       * válido hasta hoy.
       */
      updates.lateInterestCalculatedAt = this.normalizeDate(new Date());
    }

    await this.installmentsRepo.update(id, updates);
  }

  // ============================================================
  // COMPATIBILIDAD CON CÓDIGO EXISTENTE
  // ============================================================

  async updateLateInterestRate(id: string, rate: number): Promise<void> {
    return this.updateLateInterest(id, {
      dailyLateInterestRate: rate,
    });
  }

  // ============================================================
  // CALCULAR MORA
  //
  // CÁLCULO INCREMENTAL.
  // NO vuelve a recalcular desde el vencimiento
  // cada vez.
  // ============================================================

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

    const currentInterest = this.roundMoney(
      Number(installment.lateInterestAmount ?? 0),
    );

    /*
     * Todavía no venció.
     */
    if (today.getTime() <= dueDate.getTime()) {
      return currentInterest;
    }

    const rate = Number(installment.dailyLateInterestRate ?? 0);

    const remainingAmount = Number(installment.remainingAmount ?? 0);

    /*
     * Marcamos OVERDUE aunque la tasa
     * sea cero.
     */
    if (installment.status !== InstallmentStatus.OVERDUE) {
      await this.installmentsRepo.update(id, {
        status: InstallmentStatus.OVERDUE,
      });
    }

    /*
     * Si no hay tasa o no queda capital,
     * no generamos nueva mora.
     */
    if (rate <= 0 || remainingAmount <= 0) {
      await this.installmentsRepo.update(id, {
        lateInterestCalculatedAt: today,
      });

      return currentInterest;
    }

    /*
     * Primera vez:
     * comienza desde dueDate.
     *
     * Siguientes:
     * comienza desde el último cálculo.
     */
    let calculationStart = installment.lateInterestCalculatedAt
      ? this.parseDate(installment.lateInterestCalculatedAt)
      : dueDate;

    if (calculationStart.getTime() < dueDate.getTime()) {
      calculationStart = dueDate;
    }

    if (today.getTime() <= calculationStart.getTime()) {
      return currentInterest;
    }

    const differenceMs = today.getTime() - calculationStart.getTime();

    const daysToAccrue = Math.floor(differenceMs / (1000 * 60 * 60 * 24));

    if (daysToAccrue <= 0) {
      return currentInterest;
    }

    const additionalInterest = this.roundMoney(
      remainingAmount * rate * daysToAccrue,
    );

    const newInterest = this.roundMoney(currentInterest + additionalInterest);

    await this.installmentsRepo.update(id, {
      lateInterestAmount: newInterest,

      lateInterestCalculatedAt: today,

      status: InstallmentStatus.OVERDUE,
    });

    return newInterest;
  }

  // ============================================================
  // REFINANCIACIÓN
  // ============================================================

  async refinance(
    saleId: string,
    dto: RefinanceInstallmentsDto,
    societyId: string,
  ) {
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

    let totalPending = 0;

    for (const installment of pending) {
      const interest = await this.calculateLateInterest(
        installment.installmentId,
      );

      const refreshed = await this.findById(installment.installmentId);

      totalPending += Number(refreshed.remainingAmount) + interest;
    }

    totalPending = this.roundMoney(totalPending);

    if (totalPending <= 0) {
      throw new BadRequestException("No existe saldo para refinanciar");
    }

    const installmentsCount = Math.ceil(totalPending / dto.installmentAmount);

    if (installmentsCount > 100) {
      throw new BadRequestException(
        "La refinanciación produciría más de 100 cuotas",
      );
    }

    const refinancingGroupId = randomUUID();

    const firstDueDate = this.parseDate(dto.firstDueDate);

    const clientId = pending[0].clientId;

    const inheritedLateInterestRate = Number(
      pending[0].dailyLateInterestRate ?? 0,
    );

    const firstInstallmentNumber =
      Math.max(
        ...installments.map((installment) => installment.installmentNumber),
      ) + 1;

    await this.dataSource.transaction(async (manager) => {
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

        const roundedAmount = this.roundMoney(amount);

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

          dailyLateInterestRate: inheritedLateInterestRate,

          lateInterestAmount: 0,

          lateInterestCalculatedAt: null,

          isRefinanced: false,

          refinancedAt: null,

          refinancingGroupId,

          notes: "Cuota generada por refinanciación",
        });

        await manager.save(Installment, newInstallment);

        remaining = this.roundMoney(remaining - roundedAmount);

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

      dailyLateInterestRate: inheritedLateInterestRate,
    };
  }

  // ============================================================
  // REFRESH AUXILIAR
  // ============================================================

  private async refreshIfNecessary(installment: Installment): Promise<void> {
    if (
      installment.isRefinanced ||
      installment.status === InstallmentStatus.PAID
    ) {
      return;
    }

    const today = this.normalizeDate(new Date());

    const dueDate = this.parseDate(installment.dueDate);

    if (today.getTime() > dueDate.getTime()) {
      await this.calculateLateInterest(installment.installmentId, today);
    }
  }

  // ============================================================
  // FECHA SIGUIENTE
  // ============================================================

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

  // ============================================================
  // SUMAR UN MES
  // ============================================================

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

  // ============================================================
  // FECHAS
  // ============================================================

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

  private roundMoney(value: number): number {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }
}
