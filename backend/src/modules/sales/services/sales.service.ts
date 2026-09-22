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
import { CloseSaleDto } from "../dto/close-sale.dto";
import { ScheduleDeliveryDto } from "../dto/schedule-delivery.dto";
import { ConfigureCollectionScheduleDto } from "../dto/configure-collection-schedule.dto";

import { Sale } from "../entities/sale.entity";
import { SaleProduct } from "../entities/sale-product.entity";

import { Installment } from "../../installments/entities/installment.entity";
import { Society } from "../../societies/entities/society.entity";

import { FinancingService } from "../../financing/services/financing.service";

import { SaleStatus } from "../../../common/enums/sale-status.enum";
import { ValidationStep } from "../../../common/enums/validation-step.enum";
import { ValidationStatus } from "../../../common/enums/validation-status.enum";
import { PaymentFrequency } from "../../../common/enums/payment-frequency.enum";
import { InstallmentStatus } from "../../../common/enums/installment-status.enum";
import { StaffRole } from "../../../common/enums/staff-role.enum";
import { CommissionPeriod } from "../../../common/enums/commission-period.enum";
import { CollectionScheduleType } from "../../../common/enums/collection-schedule-type.enum";

import { JwtPayload } from "../../auth/interfaces/jwt-payload.interface";
import { MarkCollectorDocumentsDto } from "../dto/mark-collector-documents.dto";

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

    @InjectRepository(Society)
    private readonly societyRepo: Repository<Society>,

    private readonly financingService: FinancingService,
  ) {}

  // ─────────────────────────────────────────────────────────────
  // QUERIES
  // ─────────────────────────────────────────────────────────────

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

  findByClient(clientId: string, societyId: string) {
    return this.salesRepo.findByClient(clientId, societyId);
  }

  async findById(id: string): Promise<Sale> {
    const sale = await this.salesRepo.findById(id);

    if (!sale) {
      throw new NotFoundException(`Venta ${id} no encontrada`);
    }

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

  // ─────────────────────────────────────────────────────────────
  // COMISIONES
  // ─────────────────────────────────────────────────────────────

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

    const closedSales = sales.filter(
      (sale) => sale.status === SaleStatus.CLOSED,
    );

    const totalCommission =
      Math.round(
        closedSales.reduce(
          (sum, sale) => sum + Number(sale.sellerCommission),
          0,
        ) * 100,
      ) / 100;

    const averageCommission =
      closedSales.length > 0
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

  // ─────────────────────────────────────────────────────────────
  // CREAR VENTA
  // ─────────────────────────────────────────────────────────────

  async createSale(dto: CreateSaleDto, user: JwtPayload): Promise<Sale> {
    const { staffId, societyId, name } = this.extractUser(user);

    if (!dto.products || dto.products.length === 0) {
      throw new BadRequestException(
        "La venta debe contener al menos un producto",
      );
    }

    const totalAmount =
      Math.round(
        dto.products.reduce(
          (sum, product) => sum + product.unitPrice * product.quantity,
          0,
        ) * 100,
      ) / 100;

    let installmentsCount = dto.installmentsCount;

    let paymentFrequency = dto.paymentFrequency;

    let financingRate = 0;

    // ─────────────────────────────────────────
    // PLAN DE FINANCIACIÓN
    // ─────────────────────────────────────────

    let selectedPlan = dto.financingPlanId
      ? await this.financingService.findOnePlan(societyId, dto.financingPlanId)
      : null;

    // ─────────────────────────────────────────
    // PROMOCIÓN
    // ─────────────────────────────────────────

    const selectedPromotion = dto.promotionId
      ? await this.financingService.findOnePromotion(societyId, dto.promotionId)
      : null;

    /*
     * Si la promoción pertenece a un plan,
     * ese plan pasa a ser la referencia
     * del financiamiento.
     */
    if (selectedPromotion?.financingPlanId) {
      selectedPlan = await this.financingService.findOnePlan(
        societyId,
        selectedPromotion.financingPlanId,
      );
    }

    // ─────────────────────────────────────────
    // APLICAR PLAN
    // ─────────────────────────────────────────

    if (selectedPlan) {
      if (!selectedPlan.isActive) {
        throw new BadRequestException(
          "El plan de financiación seleccionado está inactivo",
        );
      }

      installmentsCount = selectedPlan.installmentsCount;

      paymentFrequency = selectedPlan.paymentFrequency;

      financingRate = Number(
        selectedPlan.financingConfiguration?.financingRate ?? 0,
      );
    }

    // ─────────────────────────────────────────
    // APLICAR PROMOCIÓN
    // ─────────────────────────────────────────

    if (selectedPromotion) {
      if (!selectedPromotion.isActive) {
        throw new BadRequestException(
          "La promoción seleccionada está inactiva",
        );
      }

      /*
       * Si la promoción no tiene un plan
       * asociado puede definir directamente
       * cantidad y frecuencia.
       */
      if (!selectedPlan) {
        installmentsCount =
          selectedPromotion.installmentsCount ?? installmentsCount;

        paymentFrequency =
          selectedPromotion.paymentFrequency ?? paymentFrequency;
      }

      /*
       * discountPercentage funciona como
       * ajuste sobre la tasa:
       *
       * +0.05 => 5% de recargo
       * -0.05 => 5% de descuento
       */
      financingRate += Number(selectedPromotion.discountPercentage ?? 0);
    }

    if (installmentsCount < 1 || installmentsCount > 100) {
      throw new BadRequestException(
        "La cantidad de cuotas debe estar entre 1 y 100",
      );
    }

    /*
     * Evitamos que una promoción negativa
     * produzca un total menor o igual a 0.
     */
    financingRate = Math.max(-0.99, financingRate);

    const totalWithInterest =
      Math.round(totalAmount * (1 + financingRate) * 100) / 100;

    const installmentAmount =
      Math.round((totalWithInterest / installmentsCount) * 100) / 100;

    /*
     * Comisión sobre el precio del producto,
     * no sobre la financiación.
     */
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
      installmentsCount,
      paymentFrequency,
      saleDate,

      observation: dto.observation,

      financingPlanId: dto.financingPlanId ?? null,

      promotionId: dto.promotionId ?? null,

      status: SaleStatus.PENDING_ADMIN_VALIDATION,
    });

    // ─────────────────────────────────────────
    // PRODUCTOS DE LA VENTA
    // ─────────────────────────────────────────

    await Promise.all(
      dto.products.map((product) =>
        this.saleProductRepo.save(
          this.saleProductRepo.create({
            saleId: sale.saleId,

            productId: product.productId,

            quantity: product.quantity,

            unitPrice: product.unitPrice,

            subtotal:
              Math.round(product.unitPrice * product.quantity * 100) / 100,

            /*
             * Datos particulares del
             * producto vendido.
             *
             * Ej:
             * marca,
             * modelo,
             * pulgadas,
             * número de serie,
             * etc.
             */
            customDetails: product.customDetails ?? null,
          }),
        ),
      ),
    );

    await this.historyRepo.create({
      saleId: sale.saleId,

      action: "SALE_CREATED",

      snapshot: {
        ...sale,

        financingRate,

        totalWithInterest,

        financingPlanId: dto.financingPlanId ?? null,

        promotionId: dto.promotionId ?? null,
      } as unknown as object,

      performedBy: staffId,
      performedByName: name,
    });

    return sale;
  }

  // ─────────────────────────────────────────────────────────────
  // VALIDACIÓN ADMINISTRATIVA
  // ─────────────────────────────────────────────────────────────

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

  // ─────────────────────────────────────────────────────────────
  // CONFIGURACIÓN DE COBRANZA
  // ─────────────────────────────────────────────────────────────

  async configureCollectionSchedule(
    saleId: string,
    dto: ConfigureCollectionScheduleDto,
    user: JwtPayload,
  ): Promise<Sale> {
    const { staffId, name } = this.extractUser(user);

    const sale = await this.findById(saleId);

    /*
     * REGLA DE NEGOCIO:
     *
     * La cobranza recurrente se configura únicamente
     * después de:
     *
     * 1. entregar el producto;
     * 2. cobrar la cuota 1;
     * 3. Administración recibir el dinero;
     * 4. Administración cerrar la venta.
     */
    if (sale.status !== SaleStatus.CLOSED) {
      throw new BadRequestException(
        "La venta debe estar cerrada antes de configurar la cobranza recurrente",
      );
    }

    if (!sale.assignedCollectorId) {
      throw new BadRequestException(
        "La venta debe tener un cobrador asignado antes de configurar la cobranza recurrente",
      );
    }

    const scheduleType =
      dto.collectionScheduleType ?? sale.collectionScheduleType;

    if (!scheduleType) {
      throw new BadRequestException(
        "Debes indicar el tipo de programación de cobranza",
      );
    }

    // ─────────────────────────────────────────
    // DÍA FIJO
    // ─────────────────────────────────────────

    if (scheduleType === CollectionScheduleType.FIXED_WEEKDAY) {
      const weekday = dto.collectionWeekday ?? sale.collectionWeekday;

      if (weekday === null || weekday === undefined) {
        throw new BadRequestException("Debes indicar el día fijo de cobranza");
      }

      if (weekday < 0 || weekday > 6) {
        throw new BadRequestException("El día fijo debe estar entre 0 y 6");
      }
    }

    // ─────────────────────────────────────────
    // RANGO MENSUAL
    // ─────────────────────────────────────────

    if (scheduleType === CollectionScheduleType.MONTHLY_RANGE) {
      const rangeStart = dto.paymentRangeStartDay ?? sale.paymentRangeStartDay;

      const rangeEnd = dto.paymentRangeEndDay ?? sale.paymentRangeEndDay;

      if (
        rangeStart === null ||
        rangeStart === undefined ||
        rangeEnd === null ||
        rangeEnd === undefined
      ) {
        throw new BadRequestException("Debes indicar el rango mensual de pago");
      }

      if (rangeStart < 1 || rangeStart > 31 || rangeEnd < 1 || rangeEnd > 31) {
        throw new BadRequestException(
          "Los días del rango deben estar entre 1 y 31",
        );
      }

      if (rangeStart > rangeEnd) {
        throw new BadRequestException(
          "El inicio del rango no puede ser posterior al final",
        );
      }

      const manualCollectionDate = dto.manualCollectionDate
        ? this.parseDate(dto.manualCollectionDate)
        : sale.manualCollectionDate
          ? this.parseDate(sale.manualCollectionDate)
          : null;

      if (!manualCollectionDate) {
        throw new BadRequestException(
          "Debes indicar la fecha concreta coordinada con el cliente dentro del rango mensual",
        );
      }

      const day = manualCollectionDate.getDate();

      if (day < rangeStart || day > rangeEnd) {
        throw new BadRequestException(
          "La fecha coordinada debe estar dentro del rango mensual configurado",
        );
      }
    }

    // ─────────────────────────────────────────
    // SEGUNDA CUOTA
    // ─────────────────────────────────────────

    if (dto.secondDueDate && sale.firstDueDate) {
      const first = this.parseDate(sale.firstDueDate);

      const second = this.parseDate(dto.secondDueDate);

      if (second.getTime() <= first.getTime()) {
        throw new BadRequestException(
          "La segunda cuota debe vencer después de la primera",
        );
      }
    }

    // ─────────────────────────────────────────
    // MORA POR SUCURSAL + OVERRIDE POR VENTA
    // ─────────────────────────────────────────

    const society = await this.societyRepo.findOne({
      where: {
        societyId: sale.societyId,
      },
    });

    const currentSaleRate = Number(sale.dailyLateInterestRate ?? 0);

    const effectiveLateInterestRate =
      dto.dailyLateInterestRate !== undefined
        ? dto.dailyLateInterestRate
        : currentSaleRate > 0
          ? currentSaleRate
          : Number(society?.defaultDailyLateInterestRate ?? 0);

    // ─────────────────────────────────────────
    // ACTUALIZACIÓN
    // ─────────────────────────────────────────

    const updateData: Partial<Sale> = {
      collectionScheduleType: scheduleType,

      dailyLateInterestRate: effectiveLateInterestRate,
    };

    if (scheduleType === CollectionScheduleType.FIXED_WEEKDAY) {
      updateData.collectionWeekday =
        dto.collectionWeekday ?? sale.collectionWeekday;

      updateData.paymentRangeStartDay = null;

      updateData.paymentRangeEndDay = null;

      updateData.manualCollectionDate = null;
    }

    if (scheduleType === CollectionScheduleType.MONTHLY_RANGE) {
      updateData.collectionWeekday = null;

      updateData.paymentRangeStartDay =
        dto.paymentRangeStartDay ?? sale.paymentRangeStartDay;

      updateData.paymentRangeEndDay =
        dto.paymentRangeEndDay ?? sale.paymentRangeEndDay;

      updateData.manualCollectionDate = dto.manualCollectionDate
        ? this.parseDate(dto.manualCollectionDate)
        : (sale.manualCollectionDate ?? null);
    }

    /*
     * A esta altura la cuota 1 ya forma parte
     * del historial financiero y NO se modifica.
     *
     * firstInstallmentOnDelivery / firstDueDate
     * quedan fuera de esta etapa.
     */

    if (dto.secondDueDate) {
      updateData.secondDueDate = this.parseDate(dto.secondDueDate);
    }

    await this.salesRepo.update(saleId, updateData);

    const updatedSale = await this.findById(saleId);

    /*
     * No regeneramos todo el plan.
     *
     * La cuota 1 ya tiene un pago registrado.
     * Reprogramamos solamente cuota 2 en adelante.
     */
    await this.rescheduleFutureInstallments(updatedSale);

    const finalSale = await this.findById(saleId);

    await this.historyRepo.create({
      saleId,

      action: "COLLECTION_SCHEDULE_CONFIGURED",

      snapshot: {
        collectionScheduleType: finalSale.collectionScheduleType,

        collectionWeekday: finalSale.collectionWeekday,

        paymentRangeStartDay: finalSale.paymentRangeStartDay,

        paymentRangeEndDay: finalSale.paymentRangeEndDay,

        manualCollectionDate: finalSale.manualCollectionDate,

        firstInstallmentOnDelivery: finalSale.firstInstallmentOnDelivery,

        firstDueDate: finalSale.firstDueDate,

        secondDueDate: finalSale.secondDueDate,

        dailyLateInterestRate: finalSale.dailyLateInterestRate,

        automationStartsFromInstallment: finalSale.firstInstallmentOnDelivery
          ? 2
          : 1,
      } as object,

      performedBy: staffId,

      performedByName: name,
    });

    return finalSale;
  }

  // ─────────────────────────────────────────────────────────────
  // VALIDACIÓN AMBIENTAL
  // ─────────────────────────────────────────────────────────────

  async envValidate(
    saleId: string,
    dto: ValidateSaleDto,
    user: JwtPayload,
  ): Promise<void> {
    const { staffId, name, role } = this.extractUser(user);

    const sale = await this.findById(saleId);

    // ============================================================
    // ESTADO
    // ============================================================

    if (sale.status !== SaleStatus.PENDING_ENVIRONMENTAL_VISIT) {
      throw new BadRequestException(
        `La venta debe estar en estado ${SaleStatus.PENDING_ENVIRONMENTAL_VISIT}`,
      );
    }

    // ============================================================
    // COBRADOR ASIGNADO
    // ============================================================

    if (
      role === StaffRole.COLLECTOR &&
      sale.assignedCollectorId &&
      sale.assignedCollectorId !== staffId
    ) {
      throw new ForbiddenException("No eres el cobrador asignado a esta venta");
    }

    // ============================================================
    // VALIDACIÓN DE RECHAZO
    // ============================================================

    if (dto.status === "rejected" && !dto.observations?.trim()) {
      throw new BadRequestException(
        "Debe ingresar una observación indicando el motivo del rechazo",
      );
    }

    // ============================================================
    // DOCUMENTACIÓN DE LA VISITA
    // ============================================================

    /**
     * Si la visita se aprueba,
     * el cobrador debe indicar expresamente
     * qué documentación recibió.
     *
     * No obligamos a que todos los checks sean true,
     * porque puede faltar documentación y eso debe
     * quedar registrado mediante observaciones.
     */

    if (dto.status === "approved") {
      if (
        dto.dniCopyReceived === undefined ||
        dto.salaryReceiptReceived === undefined ||
        dto.otherDocumentsReceived === undefined
      ) {
        throw new BadRequestException(
          "Debe completar el checklist de documentación recibida antes de aprobar la visita",
        );
      }
    }

    // ============================================================
    // NUEVO ESTADO
    // ============================================================

    const newStatus =
      dto.status === "approved"
        ? SaleStatus.PENDING_DELIVERY
        : SaleStatus.ENVIRONMENTAL_REJECTED;

    await this.salesRepo.updateStatus(saleId, newStatus);

    // ============================================================
    // CUOTAS
    // ============================================================

    /**
     * Normalmente deliveryDate todavía no existe,
     * porque Administración la coordina después
     * de que la visita ambiental fue aprobada.
     *
     * Dejamos este comportamiento por compatibilidad
     * con ventas anteriores.
     */

    if (dto.status === "approved" && sale.deliveryDate) {
      await this.generateInstallments(sale, sale.deliveryDate);
    }

    // ============================================================
    // VALIDACIÓN AUDITABLE
    // ============================================================

    await this.validationsRepo.create({
      saleId,

      staffId,

      step: ValidationStep.ENVIRONMENTAL_VISIT,

      status:
        dto.status === "approved"
          ? ValidationStatus.APPROVED
          : ValidationStatus.REJECTED,

      observations: dto.observations,

      dniCopyReceived: dto.dniCopyReceived,

      salaryReceiptReceived: dto.salaryReceiptReceived,

      otherDocumentsReceived: dto.otherDocumentsReceived,

      validatedAt: new Date(),
    });

    // ============================================================
    // HISTORIAL
    // ============================================================

    await this.historyRepo.create({
      saleId,

      action:
        dto.status === "approved"
          ? "ENVIRONMENTAL_APPROVED"
          : "ENVIRONMENTAL_REJECTED",

      snapshot: {
        previousStatus: sale.status,

        newStatus,

        observations: dto.observations ?? null,

        documents: {
          dniCopyReceived: dto.dniCopyReceived ?? null,

          salaryReceiptReceived: dto.salaryReceiptReceived ?? null,

          otherDocumentsReceived: dto.otherDocumentsReceived ?? null,
        },
      } as object,

      performedBy: staffId,

      performedByName: name,
    });
  }
  // ─────────────────────────────────────────────────────────────
  // GENERACIÓN DE CUOTAS
  // ─────────────────────────────────────────────────────────────

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

  private async rescheduleFutureInstallments(sale: Sale): Promise<void> {
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
  // SIGUIENTE DÍA DE SEMANA
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

  // ─────────────────────────────────────────────────────────────
  // CALCULAR SIGUIENTE VENCIMIENTO
  // ─────────────────────────────────────────────────────────────

  private getNextInstallmentDate(
    currentDate: Date,
    frequency: PaymentFrequency,
  ): Date {
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
   *
   * Ejemplo:
   *
   * 10/09 -> 10/10
   * 10/10 -> 10/11
   *
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

  // ─────────────────────────────────────────────────────────────
  // ENTREGA
  // ─────────────────────────────────────────────────────────────

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
      throw new ForbiddenException("No eres el cobrador asignado a esta venta");
    }

    /*
     * La entrega debería tener una fecha
     * coordinada antes de confirmarse.
     */
    if (!sale.deliveryDate) {
      throw new BadRequestException(
        "La venta no tiene una fecha de entrega coordinada",
      );
    }

    /*
     * Nos aseguramos de que exista el plan
     * de cuotas antes de marcarla entregada.
     */
    await this.generateInstallments(sale, sale.deliveryDate);

    await this.salesRepo.updateStatus(saleId, SaleStatus.DELIVERED);

    await this.historyRepo.create({
      saleId,

      action: "DELIVERY_CONFIRMED_BY_COLLECTOR",

      snapshot: {
        confirmedAt: new Date(),

        deliveryDate: sale.deliveryDate,
      } as object,

      performedBy: staffId,

      performedByName: name,
    });
  }

  // ─────────────────────────────────────────────────────────────
  // ENTREGA FALLIDA
  // ─────────────────────────────────────────────────────────────

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
      throw new ForbiddenException("No eres el cobrador asignado a esta venta");
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

  // ─────────────────────────────────────────────────────────────
  // CERRAR VENTA
  // ─────────────────────────────────────────────────────────────

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

    let firstInstallment: Installment | null = null;

    /*
     * Si el negocio cobra cuota 1 con la entrega,
     * Administración sólo puede cerrar cuando ese
     * dinero ya fue registrado en el sistema.
     */
    if (sale.firstInstallmentOnDelivery) {
      firstInstallment = await this.installmentRepo.findOne({
        where: {
          saleId,

          installmentNumber: 1,
        },
      });

      if (!firstInstallment) {
        throw new BadRequestException(
          "No se encontró la primera cuota de la venta",
        );
      }

      if (
        firstInstallment.status !== InstallmentStatus.PAID ||
        Number(firstInstallment.remainingAmount) > 0
      ) {
        throw new BadRequestException(
          "No se puede cerrar la venta hasta que la primera cuota haya sido cobrada completamente",
        );
      }
    }

    const finalDeliveryDate = dto.deliveryDate ?? sale.deliveryDate;

    if (!finalDeliveryDate) {
      throw new BadRequestException(
        "La venta no tiene una fecha de entrega registrada",
      );
    }

    await this.salesRepo.update(saleId, {
      status: SaleStatus.CLOSED,

      deliveryDate: finalDeliveryDate,
    });

    /*
     * IMPORTANTE:
     *
     * No regeneramos cuotas acá.
     *
     * El cierre representa que Administración
     * recibió/confirmó el dinero de la entrega.
     * La programación de cuota 2+ se realiza
     * después con configureCollectionSchedule().
     */

    await this.historyRepo.create({
      saleId,

      action: "SALE_CLOSED",

      snapshot: {
        previousStatus: sale.status,

        newStatus: SaleStatus.CLOSED,

        deliveryDate: finalDeliveryDate,

        firstInstallmentId: firstInstallment?.installmentId ?? null,

        firstInstallmentStatus: firstInstallment?.status ?? null,

        firstInstallmentPaidAmount: firstInstallment
          ? Number(firstInstallment.paidAmount)
          : null,

        deliveryCollectionConfirmed: true,
      } as object,

      performedBy: staffId,

      performedByName: name,
    });
  }

  // ─────────────────────────────────────────────────────────────
  // COORDINAR ENTREGA
  // ─────────────────────────────────────────────────────────────

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
        previousDeliveryDate: sale.deliveryDate ?? null,

        deliveryDate: dto.deliveryDate,
      } as object,

      performedBy: staffId,

      performedByName: name,
    });
  }

  // ─────────────────────────────────────────────────────────────
  // OBSERVACIÓN
  // ─────────────────────────────────────────────────────────────

  async updateObservation(
    saleId: string,
    observation: string | undefined,
  ): Promise<void> {
    await this.findById(saleId);

    await this.salesRepo.update(saleId, {
      observation: observation ?? (null as any),
    });
  }

  // ─────────────────────────────────────────────────────────────
  // ASIGNAR / REASIGNAR COBRADOR
  // ─────────────────────────────────────────────────────────────

  async assignCollector(
    saleId: string,
    collectorId: string,
    user: JwtPayload,
  ): Promise<void> {
    const { staffId, name } = this.extractUser(user);

    const sale = await this.findById(saleId);

    const previousCollectorId = sale.assignedCollectorId;

    await this.salesRepo.update(saleId, {
      assignedCollectorId: collectorId,
    });

    await this.historyRepo.create({
      saleId,

      action: previousCollectorId
        ? "COLLECTOR_REASSIGNED"
        : "COLLECTOR_ASSIGNED",

      snapshot: {
        previousCollectorId: previousCollectorId ?? null,

        newCollectorId: collectorId,
      } as object,

      performedBy: staffId,

      performedByName: name,
    });
  }

  // ─────────────────────────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────────────────────────

  private parseDate(value: Date | string): Date {
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
  ): {
    from: Date;
    to: Date;
  } {
    const anchor = dateStr ? new Date(dateStr) : new Date();

    if (Number.isNaN(anchor.getTime())) {
      throw new BadRequestException("Fecha inválida");
    }

    let from: Date;
    let to: Date;

    switch (period) {
      case CommissionPeriod.YEAR: {
        from = new Date(anchor.getFullYear(), 0, 1);

        to = new Date(anchor.getFullYear(), 11, 31, 23, 59, 59, 999);

        break;
      }

      case CommissionPeriod.MONTH: {
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
      }

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

      case CommissionPeriod.DAY: {
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
      }

      default: {
        throw new BadRequestException(
          "period debe ser day, week, month o year",
        );
      }
    }

    return {
      from,
      to,
    };
  }
  async markCollectorDocumentsDelivered(
    saleId: string,
    dto: MarkCollectorDocumentsDto,
    user: JwtPayload,
  ): Promise<Sale> {
    const { staffId, name } = this.extractUser(user);

    const sale = await this.findById(saleId);

    // ============================================================
    // SOCIEDAD
    // ============================================================

    if (sale.societyId !== user.societyId) {
      throw new ForbiddenException("La venta no pertenece a esta sociedad");
    }

    // ============================================================
    // ETAPA VÁLIDA
    // ============================================================

    /**
     * La entrega de documentación al cobrador
     * pertenece al tramo de visita ambiental.
     *
     * Permitimos marcarla mientras la venta está:
     *
     * - pendiente de visita ambiental
     * - pendiente de entrega
     *
     * Esto da margen operativo si Administración
     * confirma los papeles inmediatamente después
     * de aprobar la visita.
     */
    if (
      sale.status !== SaleStatus.PENDING_ENVIRONMENTAL_VISIT &&
      sale.status !== SaleStatus.PENDING_DELIVERY
    ) {
      throw new BadRequestException(
        "La entrega de documentación sólo puede registrarse durante la etapa ambiental o antes de la entrega",
      );
    }

    // ============================================================
    // COBRADOR ASIGNADO
    // ============================================================

    if (!sale.assignedCollectorId) {
      throw new BadRequestException(
        "La venta debe tener un cobrador asignado antes de registrar la entrega de documentación",
      );
    }

    // ============================================================
    // ACTUALIZACIÓN
    // ============================================================

    const delivered = dto.delivered;

    const deliveredAt = delivered ? new Date() : null;

    const deliveredBy = delivered ? staffId : null;

    await this.salesRepo.update(saleId, {
      collectorDocumentsDelivered: delivered,

      collectorDocumentsDeliveredAt: deliveredAt,

      collectorDocumentsDeliveredBy: deliveredBy,
    });

    // ============================================================
    // HISTORIAL
    // ============================================================

    await this.historyRepo.create({
      saleId,

      action: delivered
        ? "COLLECTOR_DOCUMENTS_DELIVERED"
        : "COLLECTOR_DOCUMENTS_DELIVERY_REVOKED",

      snapshot: {
        collectorDocumentsDelivered: delivered,

        collectorDocumentsDeliveredAt: deliveredAt,

        collectorDocumentsDeliveredBy: deliveredBy,

        collectorId: sale.assignedCollectorId,

        notes: dto.notes ?? null,
      } as object,

      performedBy: staffId,

      performedByName: name,
    });

    return this.findById(saleId);
  }
}
