import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from "@nestjs/common";

import {
  IRouteSheetItemsRepository,
  ROUTE_SHEET_ITEMS_REPOSITORY,
} from "../interfaces/route-sheet-items-repository.interface";

import {
  IRouteSheetsRepository,
  ROUTE_SHEETS_REPOSITORY,
} from "../interfaces/route-sheets-repository.interface";

import { UpdateRouteSheetItemDto } from "../dto/update-route-sheet-item.dto";
import { RouteSheetItem } from "../entities/route-sheet-item.entity";
import { RouteSheetItemType } from "../../../common/enums/route-sheet-item-type.enum";
import { RouteSheetItemResult } from "../../../common/enums/route-sheet-item-result.enum";
import { StaffRole } from "../../../common/enums/staff-role.enum";
import { SalesService } from "../../sales/services/sales.service";
import { InstallmentsService } from "../../installments/services/installments.service";
import { PaymentsService } from "../../payments/services/payments.service";
import { FailedVisitsService } from "../../failed-visits/services/failed-visits.service";
import { JwtPayload } from "../../auth/interfaces/jwt-payload.interface";

@Injectable()
export class RouteSheetItemsService {
  constructor(
    @Inject(ROUTE_SHEET_ITEMS_REPOSITORY)
    private readonly itemsRepo: IRouteSheetItemsRepository,

    @Inject(ROUTE_SHEETS_REPOSITORY)
    private readonly routeSheetsRepo: IRouteSheetsRepository,

    private readonly salesService: SalesService,
    private readonly installmentsService: InstallmentsService,
    private readonly paymentsService: PaymentsService,
    private readonly failedVisitsService: FailedVisitsService,
  ) {}

  findByRouteSheet(routeSheetId: string): Promise<RouteSheetItem[]> {
    return this.itemsRepo.findByRouteSheet(routeSheetId);
  }

  async findById(id: string): Promise<RouteSheetItem> {
    const item = await this.itemsRepo.findById(id);

    if (!item) {
      throw new NotFoundException(`Ítem de hoja de ruta ${id} no encontrado`);
    }

    return item;
  }

  async updateResult(
    id: string,
    dto: UpdateRouteSheetItemDto,
    user: JwtPayload,
  ): Promise<void> {
    const item = await this.findById(id);

    const routeSheet = await this.routeSheetsRepo.findById(item.routeSheetId);

    if (!routeSheet) {
      throw new NotFoundException(
        `Hoja de ruta ${item.routeSheetId} no encontrada`,
      );
    }

    if (user.role === StaffRole.COLLECTOR && routeSheet.staffId !== user.sub) {
      throw new ForbiddenException(
        "No eres el cobrador asignado a esta hoja de ruta",
      );
    }

    // ============================================================
    // COBRO DE CUOTA
    // ============================================================

    if (
      item.itemType === RouteSheetItemType.INSTALLMENT &&
      dto.result === RouteSheetItemResult.COMPLETED
    ) {
      if (!dto.collectedAmount) {
        throw new BadRequestException(
          "collectedAmount es requerido para registrar el cobro de una cuota",
        );
      }

      if (!item.installmentId) {
        throw new BadRequestException(
          "El ítem de cuota no tiene una cuota asociada",
        );
      }

      await this.paymentsService.registerFromCollection({
        societyId: user.societyId,
        staffId: user.sub,
        installmentId: item.installmentId,
        routeSheetItemId: item.itemId,
        amount: dto.collectedAmount,
      });
    }

    // ============================================================
    // VISITA FALLIDA DE CUOTA
    // ============================================================

    if (
      item.itemType === RouteSheetItemType.INSTALLMENT &&
      dto.result === RouteSheetItemResult.FAILED
    ) {
      if (!dto.failedVisitReason) {
        throw new BadRequestException(
          "failedVisitReason es requerido para registrar una visita fallida",
        );
      }

      if (!item.installmentId) {
        throw new BadRequestException(
          "El ítem de cuota no tiene una cuota asociada",
        );
      }

      await this.failedVisitsService.record({
        routeSheetItemId: item.itemId,
        clientId: item.clientId,
        installmentId: item.installmentId,
        staffId: user.sub,
        societyId: user.societyId,
        reason: dto.failedVisitReason,
        notes: dto.notes,
      });
    }

    // ============================================================
    // ENTREGA COMPLETADA
    // ============================================================

    if (
      item.itemType === RouteSheetItemType.DELIVERY &&
      dto.result === RouteSheetItemResult.COMPLETED
    ) {
      if (!item.saleId) {
        throw new BadRequestException(
          "El ítem de entrega no tiene una venta asociada",
        );
      }

      await this.salesService.deliver(item.saleId, user);
    }

    // ============================================================
    // ENTREGA FALLIDA
    // ============================================================

    if (
      item.itemType === RouteSheetItemType.DELIVERY &&
      dto.result === RouteSheetItemResult.FAILED
    ) {
      if (!item.saleId) {
        throw new BadRequestException(
          "El ítem de entrega no tiene una venta asociada",
        );
      }

      await this.salesService.failDelivery(
        item.saleId,
        { reason: dto.notes ?? "Entrega frustrada" },
        user,
      );
    }

    // ============================================================
    // ACTUALIZAR RESULTADO
    // ============================================================

    await this.itemsRepo.updateResult(
      id,
      dto.result,
      dto.collectedAmount,
      dto.notes,
    );
  }
}
