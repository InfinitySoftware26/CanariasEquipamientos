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
  @PrimaryGeneratedColumn("uuid", {
    name: "item_id",
  })
  itemId!: string;

  // ============================================================
  // HOJA
  // ============================================================

  @Column({
    name: "route_sheet_id",
    type: "uuid",
  })
  routeSheetId!: string;

  // ============================================================
  // CLIENTE
  // ============================================================

  @Column({
    name: "client_id",
    type: "uuid",
  })
  clientId!: string;

  // ============================================================
  // CUOTA
  // ============================================================

  /**
   * Para items INSTALLMENT:
   * cuota que se está cobrando.
   *
   * Para items DELIVERY:
   * puede apuntar a la cuota Nº 1 cuando
   * firstInstallmentOnDelivery === true.
   */
  @Column({
    name: "installment_id",
    type: "uuid",
    nullable: true,
  })
  installmentId!: string | null;

  // ============================================================
  // VENTA
  // ============================================================

  @Column({
    name: "sale_id",
    type: "uuid",
    nullable: true,
  })
  saleId!: string | null;

  // ============================================================
  // TIPO DE VISITA
  // ============================================================

  @Column({
    name: "item_type",
    type: "enum",
    enum: RouteSheetItemType,
  })
  itemType!: RouteSheetItemType;

  // ============================================================
  // RESULTADO
  // ============================================================

  @Column({
    type: "enum",
    enum: RouteSheetItemResult,
    default: RouteSheetItemResult.PENDING,
  })
  result!: RouteSheetItemResult;

  // ============================================================
  // DINERO COBRADO
  // ============================================================

  @Column({
    name: "collected_amount",
    type: "decimal",
    precision: 12,
    scale: 2,
    nullable: true,
  })
  collectedAmount!: number | null;

  // ============================================================
  // TRACKING ESPECÍFICO DE ENTREGA
  // ============================================================

  /**
   * Para items DELIVERY.
   *
   * Permite dejar asentado de forma explícita
   * si el producto fue efectivamente entregado.
   */
  @Column({
    name: "product_delivered",
    type: "boolean",
    nullable: true,
  })
  productDelivered!: boolean | null;

  /**
   * Para items DELIVERY.
   *
   * Permite dejar asentado de forma explícita
   * si el cobrador recibió el dinero correspondiente
   * a la primera cuota.
   */
  @Column({
    name: "payment_received",
    type: "boolean",
    nullable: true,
  })
  paymentReceived!: boolean | null;

  // ============================================================
  // OBSERVACIONES
  // ============================================================

  @Column({
    type: "text",
    nullable: true,
  })
  notes!: string | null;

  // ============================================================
  // FECHA REAL DE VISITA
  // ============================================================

  @Column({
    name: "visited_at",
    type: "timestamptz",
    nullable: true,
  })
  visitedAt!: Date | null;

  // ============================================================
  // AUDITORÍA
  // ============================================================

  @CreateDateColumn({
    name: "created_at",
  })
  createdAt!: Date;

  @UpdateDateColumn({
    name: "updated_at",
  })
  updatedAt!: Date;
}
