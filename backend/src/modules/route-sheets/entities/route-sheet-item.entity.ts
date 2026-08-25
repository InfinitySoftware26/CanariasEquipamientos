import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

import { RouteSheetItemType } from "../../../common/enums/route-sheet-item-type.enum";
import { RouteSheetItemResult } from "../../../common/enums/route-sheet-item-result.enum";

@Entity("ROUTE_SHEET_ITEMS")
export class RouteSheetItem {
  @PrimaryGeneratedColumn("uuid", { name: "item_id" })
  itemId!: string;

  @Column({
    name: "route_sheet_id",
    type: "uuid",
  })
  routeSheetId!: string;

  @Column({
    name: "client_id",
    type: "uuid",
  })
  clientId!: string;

  @Column({
    name: "installment_id",
    type: "uuid",
    nullable: true,
  })
  installmentId!: string | null;

  @Column({
    name: "sale_id",
    type: "uuid",
    nullable: true,
  })
  saleId!: string | null;

  @Column({
    name: "item_type",
    type: "enum",
    enum: RouteSheetItemType,
  })
  itemType!: RouteSheetItemType;

  @Column({
    type: "enum",
    enum: RouteSheetItemResult,
    default: RouteSheetItemResult.PENDING,
  })
  result!: RouteSheetItemResult;

  @Column({
    name: "collected_amount",
    type: "decimal",
    precision: 12,
    scale: 2,
    nullable: true,
  })
  collectedAmount!: number | null;

  @Column({ type: "text", nullable: true })
  notes!: string | null;
  @Column({
    name: "visited_at",
    type: "timestamptz",
    nullable: true,
  })
  visitedAt!: Date | null;

  @CreateDateColumn({
    name: "created_at",
  })
  createdAt!: Date;

  @UpdateDateColumn({
    name: "updated_at",
  })
  updatedAt!: Date;
}
