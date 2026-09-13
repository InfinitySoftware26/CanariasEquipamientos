import {
  Injectable,
  Inject,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import {
  ISalesRepository,
  SALES_REPOSITORY,
} from "../interfaces/sales-repository.interface";
import {
  ISaleValidationsRepository,
  SALE_VALIDATIONS_REPOSITORY,
} from "../interfaces/sale-validations-repository.interface";
import {
  IDeliveryAttemptsRepository,
  DELIVERY_ATTEMPTS_REPOSITORY,
} from "../interfaces/delivery-attempts-repository.interface";
import {
  ISaleHistoryRepository,
  SALE_HISTORY_REPOSITORY,
} from "../interfaces/sale-history-repository.interface";

import { CreateSaleDto } from "../dto/create-sale.dto";
import { ValidateSaleDto } from "../dto/validate-sale.dto";
import { FailDeliveryDto } from "../dto/fail-delivery.dto";
import { Sale } from "../entities/sale.entity";
import { SaleProduct } from "../entities/sale-product.entity";
import { Installment } from "../../installments/entities/installment.entity";
import { FinancingService } from "../../financing/services/financing.service";
import { SaleStatus } from "../../../common/enums/sale-status.enum";
import { ValidationStep } from "../../../common/enums/validation-step.enum";
import { ValidationStatus } from "../../../common/enums/validation-status.enum";
import { PaymentFrequency } from "../../../common/enums/payment-frequency.enum";
import { InstallmentStatus } from "../../../common/enums/installment-status.enum";
import { StaffRole } from "../../../common/enums/staff-role.enum";
import { CommissionPeriod } from "../../../common/enums/commission-period.enum";
import { JwtPayload } from "../../auth/interfaces/jwt-payload.interface";
import { CloseSaleDto } from "../dto/close-sale.dto";
import { ScheduleDeliveryDto } from "../dto/schedule-delivery.dto";

const SELLER_COMMISSION_RATE = 0.1;

@Injectable()
export class SalesService {
  constructor(
    @Inject(SALES_REPOSITORY)
    private readonly salesRepo: ISalesRepository,
    @Inject(SALE_VALIDATIONS_REPOSITORY)
    private readonly validationsRepo: ISaleValidationsRepository,
    @Inject(DELIVERY_ATTEMPTS_REPOSITORY)
    private readonly deliveryAttemptsRepo: IDeliveryAttemptsRepository,
    @Inject(SALE_HISTORY_REPOSITORY)
    private readonly historyRepo: ISaleHistoryRepository,
    @InjectRepository(SaleProduct)
    private readonly saleProductRepo: Repository<SaleProduct>,
    @InjectRepository(Installment)
    private readonly installmentRepo: Repository<Installment>,
    private readonly financingService: FinancingService,
  ) { }

  // ─── QUERIES ──────────────────────────────────────────────────────────────

  findPendingValidation(societyId: string) {
    return this.salesRepo.findPendingValidation(societyId);
  }

  findBySociety(societyId: string) {
    return this.salesRepo.findBySociety(societyId);
  }

  findBySeller(staffId: string, societyId: string) {
    return this.salesRepo.findBySeller(staffId, societyId);
  }

  findByCollector(collectorId: string, societyId: string) {
    return this.salesRepo.findByCollector(collectorId, societyId);
  }

  async getSellerCommissions(
    staffId: string,
    societyId: string,
    period: CommissionPeriod,
    dateStr?: string,
  ) {
    const { from, to } = this.resolveCommissionPeriodRange(period, dateStr);
    const sales = await this.salesRepo.findBySellerInRange(
      staffId,
      societyId,
      from,
      to,
    );

    const closedSales = sales.filter((s) => s.status === SaleStatus.CLOSED);
    const totalCommission =
      Math.round(
        closedSales.reduce((sum, s) => sum + Number(s.sellerCommission), 0) *
        100,
      ) / 100;
    const averageCommission = closedSales.length
      ? Math.round((totalCommission / closedSales.length) * 100) / 100
      : 0;

    return {
      period,
      from: from.toISOString(),
      to: to.toISOString(),
      salesCount: sales.length,
      closedSalesCount: closedSales.length,
      totalCommission,
      averageCommission,
      sales,
    };
  }

  findByClient(clientId: string, societyId: string) {
    return this.salesRepo.findByClient(clientId, societyId);
  }

  async findById(id: string): Promise<Sale> {
    const sale = await this.salesRepo.findById(id);
    if (!sale) throw new NotFoundException(`Venta ${id} no encontrada`);
    return sale;
  }

  findValidations(saleId: string) {
    return this.validationsRepo.findBySale(saleId);
  }

  findDeliveryAttempts(saleId: string) {
    return this.deliveryAttemptsRepo.findBySale(saleId);
  }

  findHistory(saleId: string) {
    return this.historyRepo.findBySale(saleId);
  }

  // ─── CREAR VENTA ──────────────────────────────────────────────────────────

  async createSale(dto: CreateSaleDto, user: JwtPayload): Promise<Sale> {
    const { staffId, societyId, name } = this.extractUser(user);

    const totalAmount = dto.products.reduce(
      (sum, p) => sum + p.unitPrice * p.quantity,
      0,
    );

    // TODO: Integración Phase 2 - Financiación
    // Actualmente el cálculo de cuotas y tasas está simplificado.
    // En Phase 2, se integrará FinancingPlan y Promotion para:
    //   1. Validar installmentsCount contra el plan seleccionado
    //   2. Obtener tasa base de FinancingConfiguration
    //   3. Sumar tasa adicional de Promotion (si aplica)
    //   4. Generar cuotas con la estructura completa
    //
    // Por ahora, se usa un valor fijo para no romper el flujo.

    const fixedFinancingRate = 0.12; // Tasa temporal: 12%
    const totalWithInterest = Math.round(totalAmount * (1 + fixedFinancingRate) * 100) / 100;
    const installmentAmount =
      Math.round((totalWithInterest / dto.installmentsCount) * 100) / 100;

    // Comisión del vendedor: se calcula sobre el valor del producto (totalAmount),
    // sin los intereses de financiación que paga el cliente.
    const sellerCommission =
      Math.round(totalAmount * SELLER_COMMISSION_RATE * 100) / 100;

    const saleDate = new Date();

    const sale = await this.salesRepo.create({
      clientId: dto.clientId,
      staffId,
      societyId,
      totalAmount,
      sellerCommissionRate: SELLER_COMMISSION_RATE,
      sellerCommission,
      installmentAmount,
      installmentsCount: dto.installmentsCount,
      paymentFrequency: dto.paymentFrequency,
      saleDate,
      observation: dto.observation,
      status: SaleStatus.PENDING_ADMIN_VALIDATION,
    });

    await Promise.all(
      dto.products.map((p) =>
        this.saleProductRepo.save(
          this.saleProductRepo.create({
            saleId: sale.saleId,
            productId: p.productId,
            quantity: p.quantity,
            unitPrice: p.unitPrice,
            subtotal: p.unitPrice * p.quantity,
          }),
        ),
      ),
    );

    await this.historyRepo.create({
      saleId: sale.saleId,
      action: "SALE_CREATED",
      snapshot: sale as unknown as object,
      performedBy: staffId,
      performedByName: name,
    });

    return sale;
  }

  // ─── VALIDACIÓN ADMIN ─────────────────────────────────────────────────────

  async adminValidate(
    saleId: string,
    dto: ValidateSaleDto,
    user: JwtPayload,
  ): Promise<void> {
    const { staffId, name } = this.extractUser(user);
    const sale = await this.findById(saleId);

    if (sale.status !== SaleStatus.PENDING_ADMIN_VALIDATION) {
      throw new BadRequestException(
        `La venta debe estar en estado ${SaleStatus.PENDING_ADMIN_VALIDATION}`,
      );
    }

    const newStatus =
      dto.status === "approved"
        ? SaleStatus.PENDING_ENVIRONMENTAL_VISIT
        : SaleStatus.REJECTED_ADMIN;

    await this.salesRepo.updateStatus(saleId, newStatus);

    await this.validationsRepo.create({
      saleId,
      staffId,
      step: ValidationStep.ADMIN_VALIDATION,
      status:
        dto.status === "approved"
          ? ValidationStatus.APPROVED
          : ValidationStatus.REJECTED,
      observations: dto.observations,
      validatedAt: new Date(),
    });

    await this.historyRepo.create({
      saleId,
      action: dto.status === "approved" ? "ADMIN_APPROVED" : "ADMIN_REJECTED",
      snapshot: {
        previousStatus: sale.status,
        newStatus,
        observations: dto.observations,
      } as object,
      performedBy: staffId,
      performedByName: name,
    });
  }

  // ─── VALIDACIÓN AMBIENTAL ─────────────────────────────────────────────────

  async envValidate(
    saleId: string,
    dto: ValidateSaleDto,
    user: JwtPayload,
  ): Promise<void> {
    const { staffId, name } = this.extractUser(user);
    const sale = await this.findById(saleId);

    if (sale.status !== SaleStatus.PENDING_ENVIRONMENTAL_VISIT) {
      throw new BadRequestException(
        `La venta debe estar en estado ${SaleStatus.PENDING_ENVIRONMENTAL_VISIT}`,
      );
    }

    const newStatus =
      dto.status === "approved"
        ? SaleStatus.PENDING_DELIVERY
        : SaleStatus.ENVIRONMENTAL_REJECTED;

    await this.salesRepo.updateStatus(saleId, newStatus);

    /*
     * La fecha de entrega es la fuente de verdad para el
     * calendario de cuotas.
     *
     * Si ya fue coordinada antes de aprobar la visita,
     * generamos las cuotas inmediatamente.
     *
     * Si todavía no existe, se generarán cuando Administración
     * coordine la entrega.
     */
    if (dto.status === "approved" && sale.deliveryDate) {
      await this.generateInstallments(sale, sale.deliveryDate);
    }

    await this.validationsRepo.create({
      saleId,
      staffId,
      step: ValidationStep.ENVIRONMENTAL_VISIT,
      status:
        dto.status === "approved"
          ? ValidationStatus.APPROVED
          : ValidationStatus.REJECTED,
      observations: dto.observations,
      validatedAt: new Date(),
    });

    await this.historyRepo.create({
      saleId,
      action: "DELIVERY_CONFIRMED_BY_COLLECTOR",
      snapshot: {
        confirmedAt: new Date(),
      } as object,
      performedBy: staffId,
      performedByName: name,
    });
  }

  private async generateInstallments(
    sale: Sale,
    deliveryDate: string,
  ): Promise<void> {
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
     * Si ya existe alguna cuota con importe pagado,
     * no recalculamos el plan para no modificar
     * información histórica de cobranza.
     */
    const hasPaidInstallment = existingInstallments.some(
      (installment) =>
        Number(installment.paidAmount) > 0 ||
        installment.status === InstallmentStatus.PAID,
    );

    if (hasPaidInstallment) {
      return;
    }

    /*
     * Si existen cuotas pero todavía no se cobró ninguna,
     * las eliminamos para regenerarlas desde la nueva
     * deliveryDate.
     *
     * Esto permite que Administración pueda cambiar
     * la fecha de entrega antes de comenzar la cobranza.
     */
    if (existingInstallments.length > 0) {
      await this.installmentRepo.delete({
        saleId: sale.saleId,
      });
    }

    const installments: Partial<Installment>[] = [];

    let dueDate = new Date(`${deliveryDate}T00:00:00`);

    for (let number = 1; number <= sale.installmentsCount; number++) {
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

        status: InstallmentStatus.PENDING,
      });

      dueDate = this.getNextInstallmentDate(dueDate, sale.paymentFrequency);
    }

    await this.installmentRepo.save(
      installments.map((installment) =>
        this.installmentRepo.create(installment),
      ),
    );
  }

  //-------CALCULO---------------------------------------------------------------

  private getNextInstallmentDate(
    currentDate: Date,
    frequency: PaymentFrequency,
  ): Date {
    const nextDate = new Date(currentDate);

    switch (frequency) {
      case PaymentFrequency.DAILY:
        do {
          nextDate.setDate(nextDate.getDate() + 1);
        } while (nextDate.getDay() === 0);

        return nextDate;

      case PaymentFrequency.BIWEEKLY:
        nextDate.setDate(nextDate.getDate() + 14);
        return nextDate;

      case PaymentFrequency.WEEKLY:
        nextDate.setDate(nextDate.getDate() + 7);
        return nextDate;

      case PaymentFrequency.MONTHLY:
        nextDate.setDate(nextDate.getDate() + 28);
        return nextDate;

      default:
        return nextDate;
    }
  }

  // ─── ENTREGA ──────────────────────────────────────────────────────────────

  async deliver(saleId: string, user: JwtPayload): Promise<void> {
    const { staffId, name, role } = this.extractUser(user);
    const sale = await this.findById(saleId);

    if (sale.status !== SaleStatus.PENDING_DELIVERY) {
      throw new BadRequestException(
        `La venta debe estar en estado ${SaleStatus.PENDING_DELIVERY}`,
      );
    }

    if (
      role === StaffRole.COLLECTOR &&
      sale.assignedCollectorId &&
      sale.assignedCollectorId !== staffId
    ) {
      throw new ForbiddenException(
        "No eres el collector asignado a esta venta",
      );
    }

    await this.salesRepo.updateStatus(saleId, SaleStatus.DELIVERED);

    await this.historyRepo.create({
      saleId,
      action: "DELIVERY_CONFIRMED_BY_COLLECTOR",
      snapshot: {
        confirmedAt: new Date(),
      } as object,
      performedBy: staffId,
      performedByName: name,
    });
  }

  // ─── ENTREGA FALLIDA ──────────────────────────────────────────────────────

  async failDelivery(
    saleId: string,
    dto: FailDeliveryDto,
    user: JwtPayload,
  ): Promise<void> {
    const { staffId, name, role } = this.extractUser(user);
    const sale = await this.findById(saleId);

    if (sale.status !== SaleStatus.PENDING_DELIVERY) {
      throw new BadRequestException(
        `La venta debe estar en estado ${SaleStatus.PENDING_DELIVERY}`,
      );
    }

    if (
      role === StaffRole.COLLECTOR &&
      sale.assignedCollectorId &&
      sale.assignedCollectorId !== staffId
    ) {
      throw new ForbiddenException(
        "No eres el collector asignado a esta venta",
      );
    }

    const attemptCount = await this.deliveryAttemptsRepo.countBySale(saleId);

    await this.deliveryAttemptsRepo.create({
      saleId,
      staffId,
      attemptNumber: attemptCount + 1,
      reason: dto.reason,
      attemptedAt: new Date(),
    });

    await this.historyRepo.create({
      saleId,
      action: "DELIVERY_FAILED",
      snapshot: {
        attemptNumber: attemptCount + 1,
        reason: dto.reason,
      } as object,
      performedBy: staffId,
      performedByName: name,
    });
  }

  // ─── CERRAR VENTA ─────────────────────────────────────────────────────────

  async close(
    saleId: string,
    dto: CloseSaleDto,
    user: JwtPayload,
  ): Promise<void> {
    const { staffId, name } = this.extractUser(user);

    const sale = await this.findById(saleId);

    if (sale.status !== SaleStatus.DELIVERED) {
      throw new BadRequestException(
        `La venta debe estar en estado ${SaleStatus.DELIVERED}`,
      );
    }

    const updateData: Partial<Sale> = {
      status: SaleStatus.DELIVERED,
    };

    if (dto.deliveryDate) {
      updateData.deliveryDate = dto.deliveryDate;
    }

    updateData.status = SaleStatus.CLOSED;

    await this.salesRepo.update(saleId, updateData);

    const updatedSale = await this.findById(saleId);

    if (dto.deliveryDate) {
      await this.generateInstallments(updatedSale, dto.deliveryDate);
    }

    await this.historyRepo.create({
      saleId,
      action: "SALE_CLOSED",
      snapshot: {
        previousStatus: sale.status,
        newStatus: SaleStatus.CLOSED,
        deliveryDate: dto.deliveryDate ?? sale.deliveryDate ?? null,
      } as object,
      performedBy: staffId,
      performedByName: name,
    });
  }

  async scheduleDelivery(
    saleId: string,
    dto: ScheduleDeliveryDto,
    user: JwtPayload,
  ): Promise<void> {
    const { staffId, name } = this.extractUser(user);

    const sale = await this.findById(saleId);

    if (
      sale.status !== SaleStatus.PENDING_DELIVERY &&
      sale.status !== SaleStatus.DELIVERED
    ) {
      throw new BadRequestException(
        "La venta debe estar pendiente de entrega o entregada.",
      );
    }

    await this.salesRepo.update(saleId, {
      deliveryDate: dto.deliveryDate,
    });

    const updatedSale = await this.findById(saleId);

    await this.generateInstallments(updatedSale, dto.deliveryDate);

    await this.historyRepo.create({
      saleId,
      action: "DELIVERY_SCHEDULED",
      snapshot: {
        deliveryDate: dto.deliveryDate,
      } as object,
      performedBy: staffId,
      performedByName: name,
    });
  }

  // ─── OBSERVACIÓN ─────────────────────────────────────────────────────────

  async updateObservation(
    saleId: string,
    observation: string | undefined,
  ): Promise<void> {
    await this.findById(saleId);
    await this.salesRepo.update(saleId, {
      observation: observation ?? (null as any),
    });
  }

  // ─── REASIGNAR COLLECTOR ──────────────────────────────────────────────────

  async assignCollector(
    saleId: string,
    collectorId: string,
    user: JwtPayload,
  ): Promise<void> {
    const { staffId, name } = this.extractUser(user);
    const sale = await this.findById(saleId);

    const previousCollectorId = sale.assignedCollectorId;
    await this.salesRepo.update(saleId, { assignedCollectorId: collectorId });

    await this.historyRepo.create({
      saleId,
      action: "COLLECTOR_REASSIGNED",
      snapshot: { previousCollectorId, newCollectorId: collectorId } as object,
      performedBy: staffId,
      performedByName: name,
    });
  }

  // ─── HELPERS ──────────────────────────────────────────────────────────────

  private extractUser(user: JwtPayload) {
    return {
      staffId: user.sub,
      societyId: user.societyId,
      name: user.email,
      role: user.role as StaffRole,
    };
  }

  private resolveCommissionPeriodRange(
    period: CommissionPeriod,
    dateStr?: string,
  ): { from: Date; to: Date } {
    const anchor = dateStr ? new Date(dateStr) : new Date();
    if (isNaN(anchor.getTime())) {
      throw new BadRequestException("Fecha inválida");
    }

    let from: Date;
    let to: Date;

    switch (period) {
      case CommissionPeriod.YEAR:
        from = new Date(anchor.getFullYear(), 0, 1);
        to = new Date(anchor.getFullYear(), 11, 31, 23, 59, 59, 999);
        break;

      case CommissionPeriod.MONTH:
        from = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
        to = new Date(
          anchor.getFullYear(),
          anchor.getMonth() + 1,
          0,
          23,
          59,
          59,
          999,
        );
        break;

      case CommissionPeriod.WEEK: {
        const day = anchor.getDay();
        const diffToMonday = day === 0 ? -6 : 1 - day;
        from = new Date(
          anchor.getFullYear(),
          anchor.getMonth(),
          anchor.getDate() + diffToMonday,
        );
        to = new Date(
          from.getFullYear(),
          from.getMonth(),
          from.getDate() + 6,
          23,
          59,
          59,
          999,
        );
        break;
      }

      case CommissionPeriod.DAY:
        from = new Date(
          anchor.getFullYear(),
          anchor.getMonth(),
          anchor.getDate(),
        );
        to = new Date(
          anchor.getFullYear(),
          anchor.getMonth(),
          anchor.getDate(),
          23,
          59,
          59,
          999,
        );
        break;

      default:
        throw new BadRequestException(
          "period debe ser day, week, month o year",
        );
    }

    return { from, to };
  }
}
