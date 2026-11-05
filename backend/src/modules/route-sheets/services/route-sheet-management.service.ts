import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Inject } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { RouteSheetStatus } from "../../../common/enums/route-sheet-status.enum";
import { RouteSheetItemResult } from "../../../common/enums/route-sheet-item-result.enum";
import { StaffRole } from "../../../common/enums/staff-role.enum";
import {
  IRouteSheetsRepository,
  ROUTE_SHEETS_REPOSITORY,
} from "../interfaces/route-sheets-repository.interface";
import {
  IRouteSheetItemsRepository,
  ROUTE_SHEET_ITEMS_REPOSITORY,
} from "../interfaces/route-sheet-items-repository.interface";
import { RouteSheet } from "../entities/route-sheet.entity";
import { RouteSheetItem } from "../entities/route-sheet-item.entity";
import { CreateRouteSheetDto } from "../dto/create-route-sheet.dto";
import { JwtPayload } from "../../auth/interfaces/jwt-payload.interface";
import { RouteSheetQueryService } from "./route-sheet-query.service";
import { RouteSheetValidationService } from "./route-sheet-validation.service";
import { RouteSheetCalculationsService } from "./route-sheet-calculations.service";

const ALLOWED_TRANSITIONS: Record<RouteSheetStatus, RouteSheetStatus[]> = {
  [RouteSheetStatus.PENDING]: [
    RouteSheetStatus.IN_PROGRESS,
    RouteSheetStatus.CANCELLED,
  ],
  [RouteSheetStatus.IN_PROGRESS]: [
    RouteSheetStatus.COMPLETED,
    RouteSheetStatus.CANCELLED,
  ],
  [RouteSheetStatus.COMPLETED]: [],
  [RouteSheetStatus.CANCELLED]: [],
};

@Injectable()
export class RouteSheetManagementService {
  constructor(
    @Inject(ROUTE_SHEETS_REPOSITORY)
    private readonly routeSheetsRepo: IRouteSheetsRepository,
    @Inject(ROUTE_SHEET_ITEMS_REPOSITORY)
    private readonly itemsRepo: IRouteSheetItemsRepository,
    private readonly queryService: RouteSheetQueryService,
    private readonly validation: RouteSheetValidationService,
    private readonly calculations: RouteSheetCalculationsService,
  ) {}

  // ============================================================
  // CREAR HOJA EXTRAORDINARIA
  // ============================================================

  async create(dto: CreateRouteSheetDto, user: JwtPayload) {
    await this.validation.validateZoneAndCollector(
      user.societyId,
      dto.zoneId,
      dto.staffId,
    );

    const existing = await this.routeSheetsRepo.findActiveForStaffZoneDate(
      dto.staffId,
      dto.zoneId,
      dto.routeDate,
    );

    if (existing) {
      throw new ConflictException(
        "Ya existe una hoja de ruta activa para este cobrador, zona y fecha",
      );
    }

    /**
     * Hoja extraordinaria.
     *
     * No incorpora cuotas automáticamente.
     * Administración puede agregar una cuota
     * utilizando:
     *
     * POST /route-sheets/:id/installments
     */
    const routeSheet = await this.routeSheetsRepo.create({
      societyId: user.societyId,

      zoneId: dto.zoneId,

      staffId: dto.staffId,

      assignedBy: user.sub,

      routeDate: this.calculations.parseDate(dto.routeDate),

      status: RouteSheetStatus.PENDING,

      notes: dto.notes?.trim() || "Hoja extraordinaria",
    });

    return this.queryService.findByIdWithItems(routeSheet.routeSheetId, user);
  }

  // ============================================================
  // REASIGNAR COBRADOR
  // ============================================================

  async reassignCollector(
    routeSheetId: string,
    staffId: string,
    user: JwtPayload,
  ) {
    const routeSheet = await this.queryService.findById(routeSheetId);

    if (routeSheet.societyId !== user.societyId) {
      throw new ForbiddenException(
        "La hoja de ruta no pertenece a esta sociedad",
      );
    }

    if (
      routeSheet.status === RouteSheetStatus.COMPLETED ||
      routeSheet.status === RouteSheetStatus.CANCELLED
    ) {
      throw new BadRequestException("No se puede reasignar una hoja cerrada");
    }

    await this.validation.validateZoneAndCollector(
      user.societyId,
      routeSheet.zoneId,
      staffId,
    );

    const routeDate = this.calculations.formatDate(routeSheet.routeDate);

    const existing = await this.routeSheetsRepo.findActiveForStaffZoneDate(
      staffId,
      routeSheet.zoneId,
      routeDate,
    );

    if (existing && existing.routeSheetId !== routeSheet.routeSheetId) {
      throw new ConflictException(
        "El cobrador ya tiene una hoja activa para esta zona y fecha",
      );
    }

    await this.routeSheetsRepo.updateStaff(routeSheetId, staffId, user.sub);

    return this.queryService.findByIdWithItems(routeSheetId, user);
  }

  // ============================================================
  // ACTUALIZAR ESTADO DE LA HOJA
  // ============================================================

  async updateStatus(
    id: string,
    status: RouteSheetStatus,
    user: JwtPayload,
  ): Promise<void> {
    const routeSheet = await this.queryService.findById(id);

    if (routeSheet.societyId !== user.societyId) {
      throw new ForbiddenException(
        "La hoja de ruta no pertenece a esta sociedad",
      );
    }

    if (user.role === StaffRole.COLLECTOR && routeSheet.staffId !== user.sub) {
      throw new ForbiddenException(
        "No eres el cobrador asignado a esta hoja de ruta",
      );
    }

    if (!ALLOWED_TRANSITIONS[routeSheet.status].includes(status)) {
      throw new BadRequestException(
        `No se puede pasar de ${routeSheet.status} a ${status}`,
      );
    }

    /**
     * Una hoja sólo puede terminarse
     * cuando todas las visitas fueron atendidas.
     */
    if (status === RouteSheetStatus.COMPLETED) {
      const items = await this.itemsRepo.findByRouteSheet(id);

      const hasPendingItems = items.some(
        (item) => item.result === RouteSheetItemResult.PENDING,
      );

      if (hasPendingItems) {
        throw new BadRequestException(
          "No se puede completar la hoja mientras existan visitas pendientes",
        );
      }
    }

    await this.routeSheetsRepo.updateStatus(id, status);
  }
}
