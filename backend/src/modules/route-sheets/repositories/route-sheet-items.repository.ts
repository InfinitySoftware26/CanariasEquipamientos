import { Injectable } from "@nestjs/common";

import { InjectRepository } from "@nestjs/typeorm";

import { Repository } from "typeorm";

import { RouteSheetItem } from "../entities/route-sheet-item.entity";

import { IRouteSheetItemsRepository } from "../interfaces/route-sheet-items-repository.interface";

import { RouteSheetItemResult } from "../../../common/enums/route-sheet-item-result.enum";

import { RouteSheetStatus } from "../../../common/enums/route-sheet-status.enum";

@Injectable()
export class RouteSheetItemsRepository implements IRouteSheetItemsRepository {
  constructor(
    @InjectRepository(RouteSheetItem)
    private readonly repo: Repository<RouteSheetItem>,
  ) {}

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

  findById(id: string): Promise<RouteSheetItem | null> {
    return this.repo.findOne({
      where: {
        itemId: id,
      },
    });
  }

  async createMany(data: Partial<RouteSheetItem>[]): Promise<RouteSheetItem[]> {
    if (!data.length) {
      return [];
    }

    const entities = data.map((item) => this.repo.create(item));

    return this.repo.save(entities);
  }

  async findActiveByInstallment(
    installmentId: string,
  ): Promise<RouteSheetItem | null> {
    return this.repo
      .createQueryBuilder("item")

      .innerJoin(
        "ROUTE_SHEETS",
        "routeSheet",
        "routeSheet.route_sheet_id = item.route_sheet_id",
      )

      .where("item.installment_id = :installmentId", {
        installmentId,
      })

      .andWhere("routeSheet.status IN (:...statuses)", {
        statuses: [RouteSheetStatus.PENDING, RouteSheetStatus.IN_PROGRESS],
      })

      .getOne();
  }

  async findActiveDeliveryBySale(
    saleId: string,
  ): Promise<RouteSheetItem | null> {
    return this.repo
      .createQueryBuilder("item")

      .innerJoin(
        "ROUTE_SHEETS",
        "routeSheet",
        "routeSheet.route_sheet_id = item.route_sheet_id",
      )

      .where("item.sale_id = :saleId", {
        saleId,
      })

      .andWhere("item.installment_id IS NULL")

      .andWhere("routeSheet.status IN (:...statuses)", {
        statuses: [RouteSheetStatus.PENDING, RouteSheetStatus.IN_PROGRESS],
      })

      .getOne();
  }

  async updateResult(
    id: string,
    result: RouteSheetItemResult,
    collectedAmount?: number,
    notes?: string,
  ): Promise<void> {
    const updates: Partial<RouteSheetItem> = {
      result,
      visitedAt: new Date(),
    };

    if (collectedAmount !== undefined) {
      updates.collectedAmount = collectedAmount;
    }

    if (notes !== undefined) {
      updates.notes = notes;
    }

    await this.repo.update(
      {
        itemId: id,
      },
      updates,
    );
  }
}
