import { Injectable } from "@nestjs/common";

import { InjectRepository } from "@nestjs/typeorm";

import { Repository } from "typeorm";

import { RouteSheetItem } from "../entities/route-sheet-item.entity";

import { RouteSheet } from "../entities/route-sheet.entity";

import { IRouteSheetItemsRepository } from "../interfaces/route-sheet-items-repository.interface";

import { RouteSheetItemResult } from "../../../common/enums/route-sheet-item-result.enum";

import { RouteSheetItemType } from "../../../common/enums/route-sheet-item-type.enum";

import { RouteSheetStatus } from "../../../common/enums/route-sheet-status.enum";

@Injectable()
export class RouteSheetItemsRepository implements IRouteSheetItemsRepository {
  constructor(
    @InjectRepository(RouteSheetItem)
    private readonly repo: Repository<RouteSheetItem>,
  ) {}

  // ============================================================
  // CREAR VARIOS ITEMS
  // ============================================================

  async createMany(
    items: Partial<RouteSheetItem>[],
  ): Promise<RouteSheetItem[]> {
    if (items.length === 0) {
      return [];
    }

    const entities = this.repo.create(items);

    return this.repo.save(entities);
  }

  // ============================================================
  // ITEMS DE UNA HOJA
  // ============================================================

  findByRouteSheet(routeSheetId: string): Promise<RouteSheetItem[]> {
    return this.repo.find({
      where: {
        routeSheetId,
      },

      order: {
        createdAt: "ASC",
      },
    });
  }

  // ============================================================
  // BUSCAR ITEM
  // ============================================================

  findById(id: string): Promise<RouteSheetItem | null> {
    return this.repo.findOne({
      where: {
        itemId: id,
      },
    });
  }

  // ============================================================
  // BUSCAR CUOTA EN HOJA ACTIVA
  // ============================================================

  async findActiveByInstallment(
    installmentId: string,
  ): Promise<RouteSheetItem | null> {
    return (
      this.repo
        .createQueryBuilder("item")

        .innerJoin(
          RouteSheet,
          "sheet",
          "sheet.route_sheet_id = item.route_sheet_id",
        )

        .where("item.installment_id = :installmentId", {
          installmentId,
        })

        /**
         * Un item ya resuelto no debe bloquear
         * futuras hojas.
         *
         * Ejemplo:
         *
         * cuota vencida
         * visita fallida hoy
         * → tiene que poder reaparecer en la próxima
         *   fecha habitual.
         */
        .andWhere("item.result = :itemResult", {
          itemResult: RouteSheetItemResult.PENDING,
        })

        .andWhere("sheet.status IN (:...statuses)", {
          statuses: [RouteSheetStatus.PENDING, RouteSheetStatus.IN_PROGRESS],
        })

        .getOne()
    );
  }

  // ============================================================
  // BUSCAR ENTREGA ACTIVA DE UNA VENTA
  // ============================================================

  async findActiveDeliveryBySale(
    saleId: string,
  ): Promise<RouteSheetItem | null> {
    return (
      this.repo
        .createQueryBuilder("item")

        .innerJoin(
          RouteSheet,
          "sheet",
          "sheet.route_sheet_id = item.route_sheet_id",
        )

        .where("item.sale_id = :saleId", {
          saleId,
        })

        /**
         * IMPORTANTE:
         *
         * Antes se utilizaba:
         *
         * installment_id IS NULL
         *
         * para identificar una entrega.
         *
         * Eso deja de ser válido porque ahora
         * un item DELIVERY puede apuntar también
         * a la cuota Nº 1.
         *
         * La forma correcta de distinguirlo
         * es por item_type.
         */
        .andWhere("item.item_type = :itemType", {
          itemType: RouteSheetItemType.DELIVERY,
        })

        /**
         * Sólo consideramos una entrega como activa
         * mientras todavía no fue resuelta.
         */
        .andWhere("item.result = :itemResult", {
          itemResult: RouteSheetItemResult.PENDING,
        })

        .andWhere("sheet.status IN (:...statuses)", {
          statuses: [RouteSheetStatus.PENDING, RouteSheetStatus.IN_PROGRESS],
        })

        .getOne()
    );
  }

  // ============================================================
  // ACTUALIZAR RESULTADO
  // ============================================================

  async updateResult(
    id: string,
    result: RouteSheetItemResult,
    collectedAmount?: number,
    notes?: string,
    productDelivered?: boolean,
    paymentReceived?: boolean,
  ): Promise<void> {
    const updates: Partial<RouteSheetItem> = {
      result,

      /**
       * Cada resultado registrado representa
       * una visita efectivamente atendida.
       */
      visitedAt: new Date(),
    };

    // ==========================================================
    // MONTO
    // ==========================================================

    if (collectedAmount !== undefined) {
      updates.collectedAmount = collectedAmount;
    }

    // ==========================================================
    // NOTAS
    // ==========================================================

    if (notes !== undefined) {
      updates.notes = notes;
    }

    // ==========================================================
    // PRODUCTO ENTREGADO
    // ==========================================================

    if (productDelivered !== undefined) {
      updates.productDelivered = productDelivered;
    }

    // ==========================================================
    // DINERO RECIBIDO
    // ==========================================================

    if (paymentReceived !== undefined) {
      updates.paymentReceived = paymentReceived;
    }

    await this.repo.update(
      {
        itemId: id,
      },
      updates,
    );
  }

  // ============================================================
  // ELIMINAR ITEM
  // ============================================================

  async deleteById(id: string): Promise<void> {
    await this.repo.delete({
      itemId: id,
    });
  }
}
