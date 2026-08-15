import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { RouteSheetItem } from "../entities/route-sheet-item.entity";
import { IRouteSheetItemsRepository } from "../interfaces/route-sheet-items-repository.interface";
import { RouteSheetItemResult } from "../../../common/enums/route-sheet-item-result.enum";

@Injectable()
export class RouteSheetItemsRepository implements IRouteSheetItemsRepository {
  constructor(
    @InjectRepository(RouteSheetItem)
    private readonly repo: Repository<RouteSheetItem>,
  ) {}

  async findByRouteSheet(routeSheetId: string): Promise<RouteSheetItem[]> {
    const items = await this.repo
      .createQueryBuilder("item")
      .leftJoinAndSelect(
        "CLIENT",
        "client",
        `"client"."client_id" = "item"."client_id"`,
      )
      .leftJoinAndSelect(
        "INSTALLMENTS",
        "installment",
        `"installment"."installment_id" = "item"."installment_id"`,
      )
      .where(`"item"."route_sheet_id" = :routeSheetId`, {
        routeSheetId,
      })
      .orderBy(`"item"."created_at"`, "ASC")
      .getRawAndEntities();

    return items.entities.map((item, index) => {
      const raw = items.raw[index];

      return Object.assign(item, {
        clientName:
          [raw.client_name, raw.client_surname].filter(Boolean).join(" ") ||
          null,

        clientDocumentNumber: raw.client_document_number ?? null,
        clientAddress: raw.client_address ?? null,
        clientPhone: raw.client_phone ?? null,

        installmentAmount:
          raw.installment_amount != null
            ? Number(raw.installment_amount)
            : null,

        installmentNumber:
          raw.installment_installment_number != null
            ? Number(raw.installment_installment_number)
            : null,

        installmentStatus: raw.installment_status ?? null,

        installmentDueDate: raw.installment_due_date ?? null,

        saleTotalAmount: raw.installment_sale_id != null ? null : null,
      });
    });
  }

  findById(id: string): Promise<RouteSheetItem | null> {
    return this.repo.findOne({
      where: { itemId: id },
    });
  }

  async createMany(data: Partial<RouteSheetItem>[]): Promise<RouteSheetItem[]> {
    if (!data.length) return [];

    return this.repo.save(data.map((d) => this.repo.create(d)));
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

    await this.repo.update({ itemId: id }, updates);
  }
}
