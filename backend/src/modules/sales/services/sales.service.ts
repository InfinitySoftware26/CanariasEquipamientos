import { Injectable, Inject, BadRequestException } from "@nestjs/common";

import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import {
  ISalesRepository,
  SALES_REPOSITORY,
} from "../interfaces/sales-repository.interface";

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

import { Society } from "../../societies/entities/society.entity";

import { FinancingService } from "../../financing/services/financing.service";

import { SaleStatus } from "../../../common/enums/sale-status.enum";
import { StaffRole } from "../../../common/enums/staff-role.enum";
import { CommissionPeriod } from "../../../common/enums/commission-period.enum";
import { CollectionScheduleType } from "../../../common/enums/collection-schedule-type.enum";

import { JwtPayload } from "../../auth/interfaces/jwt-payload.interface";
import { MarkCollectorDocumentsDto } from "../dto/mark-collector-documents.dto";

import { SalesQueryService } from "./sales-query.service";
import { SellerCommissionService } from "./seller-commission.service";
import { SaleInstallmentScheduleService } from "./sale-installment-schedule.service";
import { SaleDeliveryService } from "./sale-delivery.service";
import { SaleWorkflowService } from "./sale-workflow.service";

const SELLER_COMMISSION_RATE = 0.1;

@Injectable()
export class SalesService {
  constructor(
    @Inject(SALES_REPOSITORY)
    private readonly salesRepo: ISalesRepository,

    @Inject(SALE_HISTORY_REPOSITORY)
    private readonly historyRepo: ISaleHistoryRepository,

    @InjectRepository(SaleProduct)
    private readonly saleProductRepo: Repository<SaleProduct>,

    @InjectRepository(Society)
    private readonly societyRepo: Repository<Society>,

    private readonly financingService: FinancingService,

    private readonly queryService: SalesQueryService,

    private readonly commissionService: SellerCommissionService,

    private readonly scheduleService: SaleInstallmentScheduleService,

    private readonly deliveryService: SaleDeliveryService,

    private readonly workflowService: SaleWorkflowService,
  ) {}

  // ─────────────────────────────────────────────────────────────
  // QUERIES
  // ─────────────────────────────────────────────────────────────

  findPendingValidation(societyId: string) {
    return this.queryService.findPendingValidation(societyId);
  }

  findBySociety(societyId: string) {
    return this.queryService.findBySociety(societyId);
  }

  findBySeller(staffId: string, societyId: string) {
    return this.queryService.findBySeller(staffId, societyId);
  }

  findByCollector(collectorId: string, societyId: string) {
    return this.queryService.findByCollector(collectorId, societyId);
  }

  findByClient(clientId: string, societyId: string) {
    return this.queryService.findByClient(clientId, societyId);
  }

  findById(id: string): Promise<Sale> {
    return this.queryService.findById(id);
  }

  findValidations(saleId: string) {
    return this.queryService.findValidations(saleId);
  }

  findDeliveryAttempts(saleId: string) {
    return this.queryService.findDeliveryAttempts(saleId);
  }

  findHistory(saleId: string) {
    return this.queryService.findHistory(saleId);
  }

  // ─────────────────────────────────────────────────────────────
  // COMISIONES
  // ─────────────────────────────────────────────────────────────

  getSellerCommissions(
    staffId: string,
    societyId: string,
    period: CommissionPeriod,
    dateStr?: string,
  ) {
    return this.commissionService.getSellerCommissions(
      staffId,
      societyId,
      period,
      dateStr,
    );
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
  // VALIDACION ADMINISTRATIVA
  // ─────────────────────────────────────────────────────────────

  adminValidate(
    saleId: string,
    dto: ValidateSaleDto,
    user: JwtPayload,
  ): Promise<void> {
    return this.workflowService.adminValidate(saleId, dto, user);
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
    await this.scheduleService.rescheduleFutureInstallments(updatedSale);

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
  // VALIDACION AMBIENTAL
  // ─────────────────────────────────────────────────────────────

  envValidate(
    saleId: string,
    dto: ValidateSaleDto,
    user: JwtPayload,
  ): Promise<void> {
    return this.workflowService.envValidate(saleId, dto, user);
  }

  // ─────────────────────────────────────────────────────────────
  // ENTREGA
  // ─────────────────────────────────────────────────────────────

  deliver(saleId: string, user: JwtPayload): Promise<void> {
    return this.deliveryService.deliver(saleId, user);
  }

  failDelivery(
    saleId: string,
    dto: FailDeliveryDto,
    user: JwtPayload,
  ): Promise<void> {
    return this.deliveryService.failDelivery(saleId, dto, user);
  }

  // ─────────────────────────────────────────────────────────────
  // CERRAR VENTA
  // ─────────────────────────────────────────────────────────────

  close(saleId: string, dto: CloseSaleDto, user: JwtPayload): Promise<void> {
    return this.workflowService.close(saleId, dto, user);
  }

  // ─────────────────────────────────────────────────────────────
  // COORDINAR ENTREGA
  // ─────────────────────────────────────────────────────────────

  scheduleDelivery(
    saleId: string,
    dto: ScheduleDeliveryDto,
    user: JwtPayload,
  ): Promise<void> {
    return this.deliveryService.scheduleDelivery(saleId, dto, user);
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

  assignCollector(
    saleId: string,
    collectorId: string,
    user: JwtPayload,
  ): Promise<void> {
    return this.workflowService.assignCollector(saleId, collectorId, user);
  }

  // ─────────────────────────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────────────────────────

  private parseDate(value: Date | string): Date {
    return this.scheduleService.parseDate(value);
  }

  private extractUser(user: JwtPayload) {
    return {
      staffId: user.sub,

      societyId: user.societyId,

      name: user.email,

      role: user.role as StaffRole,
    };
  }

  markCollectorDocumentsDelivered(
    saleId: string,
    dto: MarkCollectorDocumentsDto,
    user: JwtPayload,
  ): Promise<Sale> {
    return this.workflowService.markCollectorDocumentsDelivered(
      saleId,
      dto,
      user,
    );
  }
}
