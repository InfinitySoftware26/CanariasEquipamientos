import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
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

import { RouteSheetStatus } from "../../../common/enums/route-sheet-status.enum";

import { StaffRole } from "../../../common/enums/staff-role.enum";

import { SaleStatus } from "../../../common/enums/sale-status.enum";

import { SalesService } from "../../sales/services/sales.service";

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

    private readonly paymentsService: PaymentsService,

    private readonly failedVisitsService: FailedVisitsService,
  ) {}

  // ============================================================
  // LISTAR ITEMS DE UNA HOJA
  // ============================================================

  findByRouteSheet(routeSheetId: string): Promise<RouteSheetItem[]> {
    return this.itemsRepo.findByRouteSheet(routeSheetId);
  }

  // ============================================================
  // BUSCAR ITEM
  // ============================================================

  async findById(id: string): Promise<RouteSheetItem> {
    const item = await this.itemsRepo.findById(id);

    if (!item) {
      throw new NotFoundException(`Ítem de hoja de ruta ${id} no encontrado`);
    }

    return item;
  }

  // ============================================================
  // QUITAR ITEM MANUALMENTE
  // ============================================================

  async removePendingItem(id: string, user: JwtPayload): Promise<void> {
    const item = await this.findById(id);

    const routeSheet = await this.routeSheetsRepo.findById(item.routeSheetId);

    if (!routeSheet) {
      throw new NotFoundException(
        `Hoja de ruta ${item.routeSheetId} no encontrada`,
      );
    }

    // ==========================================================
    // SOCIEDAD
    // ==========================================================

    if (routeSheet.societyId !== user.societyId) {
      throw new ForbiddenException(
        "La hoja de ruta no pertenece a esta sociedad",
      );
    }

    // ==========================================================
    // ESTADO DE HOJA
    // ==========================================================

    if (
      routeSheet.status === RouteSheetStatus.COMPLETED ||
      routeSheet.status === RouteSheetStatus.CANCELLED
    ) {
      throw new BadRequestException(
        "No se pueden quitar items de una hoja cerrada o cancelada",
      );
    }

    // ==========================================================
    // RESULTADO DEL ITEM
    // ==========================================================

    if (item.result !== RouteSheetItemResult.PENDING) {
      throw new BadRequestException(
        "Sólo se pueden quitar items que todavía estén pendientes",
      );
    }

    /*
     * IMPORTANTE:
     *
     * Eliminar el item NO elimina:
     *
     * - la cuota;
     * - la venta;
     * - el cliente.
     *
     * Sólo lo quita de esta hoja.
     *
     * Como deja de existir un item PENDING,
     * la cuota podrá volver a ser seleccionada
     * manualmente o entrar en una futura hoja.
     */

    await this.itemsRepo.deleteById(id);
  }

  // ============================================================
  // REGISTRAR RESULTADO DE VISITA
  // ============================================================

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

    // ==========================================================
    // VALIDAR SOCIEDAD
    // ==========================================================

    if (routeSheet.societyId !== user.societyId) {
      throw new ForbiddenException(
        "La hoja de ruta no pertenece a esta sociedad",
      );
    }

    // ==========================================================
    // VALIDAR COBRADOR
    // ==========================================================

    if (user.role === StaffRole.COLLECTOR && routeSheet.staffId !== user.sub) {
      throw new ForbiddenException(
        "No eres el cobrador asignado a esta hoja de ruta",
      );
    }

    // ==========================================================
    // NO PROCESAR DOS VECES
    // ==========================================================

    if (item.result !== RouteSheetItemResult.PENDING) {
      throw new BadRequestException("La visita ya fue registrada");
    }

    // ==========================================================
    // COBRANZA RECURRENTE
    // ==========================================================

    if (
      item.itemType === RouteSheetItemType.INSTALLMENT &&
      dto.result === RouteSheetItemResult.COMPLETED
    ) {
      await this.registerInstallmentCollection(
        item,
        routeSheet.staffId,
        routeSheet.societyId,
        dto,
      );
    }

    // ==========================================================
    // VISITA FALLIDA DE COBRANZA
    // ==========================================================

    if (
      item.itemType === RouteSheetItemType.INSTALLMENT &&
      dto.result === RouteSheetItemResult.FAILED
    ) {
      await this.registerFailedCollectionVisit(
        item,
        routeSheet.staffId,
        routeSheet.societyId,
        dto,
      );
    }

    // ==========================================================
    // ENTREGA + CUOTA 1
    // ==========================================================

    if (
      item.itemType === RouteSheetItemType.DELIVERY &&
      dto.result === RouteSheetItemResult.COMPLETED
    ) {
      await this.registerDeliveryAndFirstInstallment(
        item,
        routeSheet.staffId,
        routeSheet.societyId,
        dto,
        user,
      );
    }

    // ==========================================================
    // ENTREGA FALLIDA
    // ==========================================================

    if (
      item.itemType === RouteSheetItemType.DELIVERY &&
      dto.result === RouteSheetItemResult.FAILED
    ) {
      await this.registerFailedDelivery(item, dto, user);
    }

    // ==========================================================
    // GUARDAR RESULTADO
    // ==========================================================

    await this.itemsRepo.updateResult(
      id,
      dto.result,
      dto.collectedAmount,
      dto.notes,
      dto.productDelivered,
      dto.paymentReceived,
    );
  }

  // ============================================================
  // COBRO DE CUOTA RECURRENTE
  // ============================================================

  private async registerInstallmentCollection(
    item: RouteSheetItem,
    staffId: string,
    societyId: string,
    dto: UpdateRouteSheetItemDto,
  ): Promise<void> {
    if (dto.collectedAmount === undefined || dto.collectedAmount <= 0) {
      throw new BadRequestException(
        "collectedAmount es requerido para registrar el cobro de una cuota",
      );
    }

    if (!item.installmentId) {
      throw new BadRequestException("El ítem no tiene una cuota asociada");
    }

    await this.paymentsService.registerFromCollection({
      societyId,

      staffId,

      installmentId: item.installmentId,

      routeSheetItemId: item.itemId,

      amount: dto.collectedAmount,

      notes: dto.notes,
    });
  }

  // ============================================================
  // VISITA FALLIDA DE COBRANZA
  // ============================================================

  private async registerFailedCollectionVisit(
    item: RouteSheetItem,
    staffId: string,
    societyId: string,
    dto: UpdateRouteSheetItemDto,
  ): Promise<void> {
    if (!dto.failedVisitReason) {
      throw new BadRequestException(
        "failedVisitReason es requerido para registrar una visita fallida",
      );
    }

    if (!item.installmentId) {
      throw new BadRequestException("El ítem no tiene una cuota asociada");
    }

    await this.failedVisitsService.record({
      routeSheetItemId: item.itemId,

      clientId: item.clientId,

      installmentId: item.installmentId,

      staffId,

      societyId,

      reason: dto.failedVisitReason,

      notes: dto.notes,
    });
  }

  // ============================================================
  // ENTREGA + PRIMERA CUOTA
  // ============================================================

  private async registerDeliveryAndFirstInstallment(
    item: RouteSheetItem,
    staffId: string,
    societyId: string,
    dto: UpdateRouteSheetItemDto,
    user: JwtPayload,
  ): Promise<void> {
    if (!item.saleId) {
      throw new BadRequestException(
        "El ítem de entrega no tiene una venta asociada",
      );
    }

    const sale = await this.salesService.findById(item.saleId);

    // ==========================================================
    // ESTADO
    // ==========================================================

    if (sale.status !== SaleStatus.PENDING_DELIVERY) {
      throw new BadRequestException(
        "La venta ya no se encuentra pendiente de entrega",
      );
    }

    /*
     * NO validamos collectorDocumentsDelivered.
     *
     * La documentación es recibida
     * durante la visita ambiental.
     *
     * Para llegar a PENDING_DELIVERY,
     * la visita ya tuvo que ser aprobada.
     */

    // ==========================================================
    // COBRADOR
    // ==========================================================

    if (sale.assignedCollectorId && sale.assignedCollectorId !== staffId) {
      throw new ForbiddenException("La venta pertenece a otro cobrador");
    }

    // ==========================================================
    // PRODUCTO
    // ==========================================================

    if (dto.productDelivered !== true) {
      throw new BadRequestException(
        "Debes confirmar que el producto fue entregado",
      );
    }

    // ==========================================================
    // CUOTA 1
    // ==========================================================

    if (sale.firstInstallmentOnDelivery) {
      if (!item.installmentId) {
        throw new BadRequestException(
          "La entrega no tiene asociada la primera cuota",
        );
      }

      if (dto.paymentReceived !== true) {
        throw new BadRequestException(
          "Debes confirmar que el dinero de la primera cuota fue recibido",
        );
      }

      if (dto.collectedAmount === undefined || dto.collectedAmount <= 0) {
        throw new BadRequestException(
          "Debes ingresar el monto recibido de la primera cuota",
        );
      }

      await this.paymentsService.registerFromCollection({
        societyId,

        staffId,

        installmentId: item.installmentId,

        routeSheetItemId: item.itemId,

        amount: dto.collectedAmount,

        notes: dto.notes ?? "Primera cuota cobrada durante la entrega",
      });
    }

    // ==========================================================
    // CONFIRMAR ENTREGA
    // ==========================================================

    await this.salesService.deliver(item.saleId, user);
  }

  // ============================================================
  // ENTREGA FALLIDA
  // ============================================================

  private async registerFailedDelivery(
    item: RouteSheetItem,
    dto: UpdateRouteSheetItemDto,
    user: JwtPayload,
  ): Promise<void> {
    if (!item.saleId) {
      throw new BadRequestException(
        "El ítem de entrega no tiene una venta asociada",
      );
    }

    await this.salesService.failDelivery(
      item.saleId,
      {
        reason: dto.notes ?? "Entrega frustrada",
      },
      user,
    );
  }
}
