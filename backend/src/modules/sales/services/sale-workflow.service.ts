import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
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
  ISaleHistoryRepository,
  SALE_HISTORY_REPOSITORY,
} from "../interfaces/sale-history-repository.interface";

import { ValidateSaleDto } from "../dto/validate-sale.dto";
import { CloseSaleDto } from "../dto/close-sale.dto";
import { MarkCollectorDocumentsDto } from "../dto/mark-collector-documents.dto";

import { Sale } from "../entities/sale.entity";
import { Installment } from "../../installments/entities/installment.entity";

import { SaleStatus } from "../../../common/enums/sale-status.enum";
import { ValidationStep } from "../../../common/enums/validation-step.enum";
import { ValidationStatus } from "../../../common/enums/validation-status.enum";
import { InstallmentStatus } from "../../../common/enums/installment-status.enum";
import { StaffRole } from "../../../common/enums/staff-role.enum";

import { JwtPayload } from "../../auth/interfaces/jwt-payload.interface";

import { SalesQueryService } from "./sales-query.service";
import { SaleInstallmentScheduleService } from "./sale-installment-schedule.service";

@Injectable()
export class SaleWorkflowService {
  constructor(
    @Inject(SALES_REPOSITORY)
    private readonly salesRepo: ISalesRepository,

    @Inject(SALE_VALIDATIONS_REPOSITORY)
    private readonly validationsRepo: ISaleValidationsRepository,

    @Inject(SALE_HISTORY_REPOSITORY)
    private readonly historyRepo: ISaleHistoryRepository,

    @InjectRepository(Installment)
    private readonly installmentRepo: Repository<Installment>,

    private readonly queryService: SalesQueryService,

    private readonly scheduleService: SaleInstallmentScheduleService,
  ) {}

  // ─────────────────────────────────────────────────────────────
  // VALIDACIÓN ADMINISTRATIVA
  // ─────────────────────────────────────────────────────────────

  async adminValidate(
    saleId: string,
    dto: ValidateSaleDto,
    user: JwtPayload,
  ): Promise<void> {
    const { staffId, name } = this.extractUser(user);

    const sale = await this.queryService.findById(saleId);

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
  // VALIDACIÓN AMBIENTAL
  // ─────────────────────────────────────────────────────────────

  async envValidate(
    saleId: string,
    dto: ValidateSaleDto,
    user: JwtPayload,
  ): Promise<void> {
    const { staffId, name, role } = this.extractUser(user);

    const sale = await this.queryService.findById(saleId);

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
      await this.scheduleService.generateInstallments(sale, sale.deliveryDate);
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
  // CERRAR VENTA
  // ─────────────────────────────────────────────────────────────

  async close(
    saleId: string,
    dto: CloseSaleDto,
    user: JwtPayload,
  ): Promise<void> {
    const { staffId, name } = this.extractUser(user);

    const sale = await this.queryService.findById(saleId);

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
  // ASIGNAR / REASIGNAR COBRADOR
  // ─────────────────────────────────────────────────────────────

  async assignCollector(
    saleId: string,
    collectorId: string,
    user: JwtPayload,
  ): Promise<void> {
    const { staffId, name } = this.extractUser(user);

    const sale = await this.queryService.findById(saleId);

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
  // DOCUMENTACIÓN ENTREGADA AL COBRADOR
  // ─────────────────────────────────────────────────────────────

  async markCollectorDocumentsDelivered(
    saleId: string,
    dto: MarkCollectorDocumentsDto,
    user: JwtPayload,
  ): Promise<Sale> {
    const { staffId, name } = this.extractUser(user);

    const sale = await this.queryService.findById(saleId);

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

    return this.queryService.findById(saleId);
  }

  private extractUser(user: JwtPayload) {
    return {
      staffId: user.sub,

      societyId: user.societyId,

      name: user.email,

      role: user.role as StaffRole,
    };
  }
}
