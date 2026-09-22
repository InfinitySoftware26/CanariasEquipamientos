import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { InjectRepository } from "@nestjs/typeorm";

import { Repository } from "typeorm";

import {
  CLOSURES_REPOSITORY,
  ClosureFilters,
  IClosuresRepository,
} from "../interfaces/closures-repository.interface";

import { CreateClosureDto } from "../dto/create-closure.dto";

import { ValidateClosureDto } from "../dto/validate-closure.dto";

import { DailyClosure } from "../entities/daily-closure.entity";

import { DailyClosureStatus } from "../../../common/enums/daily-closure-status.enum";

import { RouteSheetItemResult } from "../../../common/enums/route-sheet-item-result.enum";

import { RouteSheet } from "../../route-sheets/entities/route-sheet.entity";

import { RouteSheetItem } from "../../route-sheets/entities/route-sheet-item.entity";

import { JwtPayload } from "../../auth/interfaces/jwt-payload.interface";

import { StaffService } from "../../staff/services/staff.service";

import { NotificationsService } from "../../notifications/services/notifications.service";

import { StaffRole } from "../../../common/enums/staff-role.enum";

import { NotificationType } from "../../../common/enums/notification-type.enum";

@Injectable()
export class ClosuresService {
  constructor(
    @Inject(CLOSURES_REPOSITORY)
    private readonly closuresRepo: IClosuresRepository,

    @InjectRepository(RouteSheet)
    private readonly routeSheetRepo: Repository<RouteSheet>,

    @InjectRepository(RouteSheetItem)
    private readonly routeSheetItemRepo: Repository<RouteSheetItem>,

    private readonly staffService: StaffService,

    private readonly notificationsService: NotificationsService,
  ) {}

  // ============================================================
  // LISTADOS
  // ============================================================

  findBySociety(
    societyId: string,
    filters?: ClosureFilters,
  ): Promise<DailyClosure[]> {
    return this.closuresRepo.findBySociety(societyId, filters);
  }

  findByStaff(
    staffId: string,
    societyId: string,
    filters?: ClosureFilters,
  ): Promise<DailyClosure[]> {
    return this.closuresRepo.findByStaff(staffId, societyId, filters);
  }

  // ============================================================
  // DETALLE
  // ============================================================

  async findById(id: string): Promise<DailyClosure> {
    const closure = await this.closuresRepo.findById(id);

    if (!closure) {
      throw new NotFoundException(`Cierre ${id} no encontrado`);
    }

    return closure;
  }

  // ============================================================
  // CREAR CIERRE
  // ============================================================

  async create(dto: CreateClosureDto, user: JwtPayload): Promise<DailyClosure> {
    const existing = await this.closuresRepo.findByStaffAndDate(
      user.sub,
      dto.closingDate,
    );

    if (existing) {
      throw new ConflictException(
        "Ya existe un cierre para este cobrador en esta fecha",
      );
    }

    const closure = await this.closuresRepo.create({
      staffId: user.sub,

      societyId: user.societyId,

      closingDate: new Date(dto.closingDate),

      totalCollected: dto.totalCollected,

      notes: dto.notes,

      status: DailyClosureStatus.PENDING,
    });

    await this.notifyValidators(closure);

    return closure;
  }

  // ============================================================
  // NOTIFICAR VALIDADORES
  // ============================================================

  private async notifyValidators(closure: DailyClosure): Promise<void> {
    const staff = await this.staffService.findAll(closure.societyId);

    const validators = staff.filter(
      (staffMember) =>
        staffMember.role === StaffRole.ADMIN ||
        staffMember.role === StaffRole.MANAGER,
    );

    if (validators.length === 0) {
      return;
    }

    await this.notificationsService.notify({
      societyId: closure.societyId,

      type: NotificationType.CLOSURE,

      title: "Cierre diario pendiente de validación",

      message: `Se declaró un cierre diario por $${closure.totalCollected} que requiere validación.`,

      recipientStaffIds: validators.map((validator) => validator.staffId),

      relatedEntityType: "daily_closure",

      relatedEntityId: closure.closureId,
    });
  }

  // ============================================================
  // CONCILIACIÓN
  // ============================================================

  async getReconciliation(id: string): Promise<{
    declared: number;
    systemCalculated: number;
    difference: number;
  }> {
    const closure = await this.findById(id);

    // ==========================================================
    // HOJAS DEL COBRADOR EN ESA FECHA
    // ==========================================================

    const routeSheets = await this.routeSheetRepo.find({
      where: {
        staffId: closure.staffId,

        routeDate: closure.closingDate,
      },
    });

    const routeSheetIds = routeSheets.map(
      (routeSheet) => routeSheet.routeSheetId,
    );

    let systemCalculated = 0;

    if (routeSheetIds.length > 0) {
      const items = await this.routeSheetItemRepo
        .createQueryBuilder("item")

        .where("item.route_sheet_id IN (:...routeSheetIds)", {
          routeSheetIds,
        })

        /**
         * IMPORTANTE:
         *
         * NO filtramos por item_type.
         *
         * Antes se tomaban solamente:
         *
         * INSTALLMENT
         *
         * Eso dejaba afuera:
         *
         * DELIVERY + cuota 1
         *
         * Ahora todo item COMPLETED que tenga
         * collectedAmount forma parte de la
         * recaudación del cobrador.
         */
        .andWhere("item.result = :result", {
          result: RouteSheetItemResult.COMPLETED,
        })

        .andWhere("item.collected_amount IS NOT NULL")

        .andWhere("item.collected_amount > 0")

        .getMany();

      systemCalculated = items.reduce(
        (sum, item) => sum + Number(item.collectedAmount ?? 0),
        0,
      );
    }

    // ==========================================================
    // COMPARAR DECLARADO VS SISTEMA
    // ==========================================================

    const declared = Number(closure.totalCollected);

    const difference = declared - systemCalculated;

    return {
      declared,

      systemCalculated,

      difference,
    };
  }

  // ============================================================
  // VALIDAR / RECHAZAR CIERRE
  // ============================================================

  async validate(
    id: string,
    dto: ValidateClosureDto,
    user: JwtPayload,
  ): Promise<void> {
    const closure = await this.findById(id);

    if (closure.status !== DailyClosureStatus.PENDING) {
      throw new BadRequestException("El cierre ya fue validado");
    }

    const status =
      dto.status === "validated"
        ? DailyClosureStatus.VALIDATED
        : DailyClosureStatus.REJECTED;

    await this.closuresRepo.updateStatus(id, status, user.sub);
  }
}
