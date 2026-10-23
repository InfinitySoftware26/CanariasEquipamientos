import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
} from "@nestjs/common";

import {
  ISalesRepository,
  SALES_REPOSITORY,
} from "../interfaces/sales-repository.interface";

import {
  IDeliveryAttemptsRepository,
  DELIVERY_ATTEMPTS_REPOSITORY,
} from "../interfaces/delivery-attempts-repository.interface";

import {
  ISaleHistoryRepository,
  SALE_HISTORY_REPOSITORY,
} from "../interfaces/sale-history-repository.interface";

import { FailDeliveryDto } from "../dto/fail-delivery.dto";
import { ScheduleDeliveryDto } from "../dto/schedule-delivery.dto";

import { SaleStatus } from "../../../common/enums/sale-status.enum";
import { StaffRole } from "../../../common/enums/staff-role.enum";

import { JwtPayload } from "../../auth/interfaces/jwt-payload.interface";

import { SalesQueryService } from "./sales-query.service";
import { SaleInstallmentScheduleService } from "./sale-installment-schedule.service";

@Injectable()
export class SaleDeliveryService {
  constructor(
    @Inject(SALES_REPOSITORY)
    private readonly salesRepo: ISalesRepository,

    @Inject(DELIVERY_ATTEMPTS_REPOSITORY)
    private readonly deliveryAttemptsRepo: IDeliveryAttemptsRepository,

    @Inject(SALE_HISTORY_REPOSITORY)
    private readonly historyRepo: ISaleHistoryRepository,

    private readonly queryService: SalesQueryService,

    private readonly scheduleService: SaleInstallmentScheduleService,
  ) {}

  // ─────────────────────────────────────────────────────────────
  // ENTREGA
  // ─────────────────────────────────────────────────────────────

  async deliver(saleId: string, user: JwtPayload): Promise<void> {
    const { staffId, name, role } = this.extractUser(user);

    const sale = await this.queryService.findById(saleId);

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
    await this.scheduleService.generateInstallments(sale, sale.deliveryDate);

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

    const sale = await this.queryService.findById(saleId);

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
  // COORDINAR ENTREGA
  // ─────────────────────────────────────────────────────────────

  async scheduleDelivery(
    saleId: string,
    dto: ScheduleDeliveryDto,
    user: JwtPayload,
  ): Promise<void> {
    const { staffId, name } = this.extractUser(user);

    const sale = await this.queryService.findById(saleId);

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

    const updatedSale = await this.queryService.findById(saleId);

    await this.scheduleService.generateInstallments(
      updatedSale,
      dto.deliveryDate,
    );

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

  private extractUser(user: JwtPayload) {
    return {
      staffId: user.sub,

      societyId: user.societyId,

      name: user.email,

      role: user.role as StaffRole,
    };
  }
}
