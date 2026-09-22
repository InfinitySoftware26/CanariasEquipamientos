import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from "typeorm";

import { SaleStatus } from "../../../common/enums/sale-status.enum";
import { PaymentFrequency } from "../../../common/enums/payment-frequency.enum";
import { CollectionScheduleType } from "../../../common/enums/collection-schedule-type.enum";

import { Client } from "../../clients/entities/client.entity";
import { Staff } from "../../staff/entities/staff.entity";
import { FinancingPlan } from "../../financing/entities/financing-plan.entity";
import { Promotion } from "../../financing/entities/promotion.entity";
import { SaleProduct } from "./sale-product.entity";

@Entity("SALES")
export class Sale {
  @PrimaryGeneratedColumn("uuid", {
    name: "sale_id",
  })
  saleId!: string;

  @Column({
    name: "client_id",
    type: "uuid",
  })
  clientId!: string;

  @ManyToOne(() => Client)
  @JoinColumn({
    name: "client_id",
  })
  client!: Client;

  // ─────────────────────────────────────────
  // FINANCIACIÓN
  // ─────────────────────────────────────────

  @Column({
    name: "financing_plan_id",
    type: "uuid",
    nullable: true,
  })
  financingPlanId!: string | null;

  @ManyToOne(() => FinancingPlan, {
    nullable: true,
  })
  @JoinColumn({
    name: "financing_plan_id",
  })
  financingPlan!: FinancingPlan | null;

  @Column({
    name: "promotion_id",
    type: "uuid",
    nullable: true,
  })
  promotionId!: string | null;

  @ManyToOne(() => Promotion, {
    nullable: true,
  })
  @JoinColumn({
    name: "promotion_id",
  })
  promotion!: Promotion | null;

  // ─────────────────────────────────────────
  // PRODUCTOS
  // ─────────────────────────────────────────

  @OneToMany(() => SaleProduct, (sp) => sp.sale)
  products!: SaleProduct[];

  // ─────────────────────────────────────────
  // VENDEDOR
  // ─────────────────────────────────────────

  @Column({
    name: "staff_id",
    type: "uuid",
  })
  staffId!: string;

  @ManyToOne(() => Staff)
  @JoinColumn({
    name: "staff_id",
  })
  staff!: Staff;

  // ─────────────────────────────────────────
  // SOCIEDAD
  // ─────────────────────────────────────────

  @Column({
    name: "society_id",
    type: "uuid",
  })
  societyId!: string;

  // ─────────────────────────────────────────
  // IMPORTES
  // ─────────────────────────────────────────

  @Column({
    name: "total_amount",
    type: "decimal",
    precision: 12,
    scale: 2,
  })
  totalAmount!: number;

  @Column({
    name: "seller_commission_rate",
    type: "decimal",
    precision: 5,
    scale: 4,
    default: 0.1,
  })
  sellerCommissionRate!: number;

  @Column({
    name: "seller_commission",
    type: "decimal",
    precision: 12,
    scale: 2,
  })
  sellerCommission!: number;

  @Column({
    name: "installment_amount",
    type: "decimal",
    precision: 12,
    scale: 2,
  })
  installmentAmount!: number;

  @Column({
    name: "installments_count",
    type: "integer",
  })
  installmentsCount!: number;

  @Column({
    name: "payment_frequency",
    type: "enum",
    enum: PaymentFrequency,
  })
  paymentFrequency!: PaymentFrequency;

  @Column({
    name: "first_due_date",
    type: "date",
    nullable: true,
  })
  firstDueDate!: Date | null;

  @Column({
    name: "sale_date",
    type: "timestamptz",
  })
  saleDate!: Date;

  // ─────────────────────────────────────────
  // CONFIGURACIÓN DE COBRANZA
  // ─────────────────────────────────────────

  @Column({
    name: "collection_schedule_type",
    type: "enum",
    enum: CollectionScheduleType,
    nullable: true,
  })
  collectionScheduleType!: CollectionScheduleType | null;

  /**
   * Día fijo de cobro:
   *
   * 0 = domingo
   * 1 = lunes
   * 2 = martes
   * 3 = miércoles
   * 4 = jueves
   * 5 = viernes
   * 6 = sábado
   */
  @Column({
    name: "collection_weekday",
    type: "smallint",
    nullable: true,
  })
  collectionWeekday!: number | null;

  /**
   * Para clientes que pagan dentro de un rango.
   *
   * Ejemplo:
   * del 1 al 10.
   */
  @Column({
    name: "payment_range_start_day",
    type: "smallint",
    nullable: true,
  })
  paymentRangeStartDay!: number | null;

  @Column({
    name: "payment_range_end_day",
    type: "smallint",
    nullable: true,
  })
  paymentRangeEndDay!: number | null;

  /**
   * Día concreto coordinado por Administración
   * con el cliente dentro del rango.
   */
  @Column({
    name: "manual_collection_date",
    type: "date",
    nullable: true,
  })
  manualCollectionDate!: Date | null;

  /**
   * true:
   * la cuota 1 vence y se cobra al momento
   * de la entrega del producto.
   *
   * false:
   * se toma firstDueDate.
   */
  @Column({
    name: "first_installment_on_delivery",
    type: "boolean",
    default: true,
  })
  firstInstallmentOnDelivery!: boolean;

  /**
   * Fecha inicial de la segunda cuota.
   *
   * La automatización de cobranza comienza
   * desde esta cuota cuando la cuota 1
   * se cobra durante la entrega.
   */
  @Column({
    name: "second_due_date",
    type: "date",
    nullable: true,
  })
  secondDueDate!: Date | null;

  /**
   * Ejemplo:
   *
   * 0.002 = 0,2 % diario.
   */
  @Column({
    name: "daily_late_interest_rate",
    type: "decimal",
    precision: 7,
    scale: 6,
    default: 0,
  })
  dailyLateInterestRate!: number;

  // ─────────────────────────────────────────
  // ESTADO
  // ─────────────────────────────────────────

  @Column({
    type: "enum",
    enum: SaleStatus,
    default: SaleStatus.PENDING_ADMIN_VALIDATION,
  })
  status!: SaleStatus;

  // ─────────────────────────────────────────
  // COBRADOR
  // ─────────────────────────────────────────

  @Column({
    name: "assigned_collector_id",
    type: "uuid",
    nullable: true,
  })
  assignedCollectorId!: string | null;

  @ManyToOne(() => Staff, {
    nullable: true,
  })
  @JoinColumn({
    name: "assigned_collector_id",
  })
  collector!: Staff | null;

  @Column({
    type: "text",
    nullable: true,
  })
  observation!: string | null;

  // ─────────────────────────────────────────
  // DOCUMENTACIÓN PARA EL COBRADOR
  // ─────────────────────────────────────────

  /**
   * Se marca durante la etapa de visita ambiental.
   *
   * Indica que Administración confirmó que
   * la documentación necesaria fue entregada
   * al cobrador.
   */
  @Column({
    name: "collector_documents_delivered",
    type: "boolean",
    default: false,
  })
  collectorDocumentsDelivered!: boolean;

  /**
   * Fecha y hora exacta en la que se confirmó
   * la entrega de documentación.
   */
  @Column({
    name: "collector_documents_delivered_at",
    type: "timestamptz",
    nullable: true,
  })
  collectorDocumentsDeliveredAt!: Date | null;

  /**
   * Usuario de Administración / Manager que
   * confirmó la entrega de documentación.
   */
  @Column({
    name: "collector_documents_delivered_by",
    type: "uuid",
    nullable: true,
  })
  collectorDocumentsDeliveredBy!: string | null;

  @ManyToOne(() => Staff, {
    nullable: true,
  })
  @JoinColumn({
    name: "collector_documents_delivered_by",
  })
  collectorDocumentsDeliveredByStaff!: Staff | null;

  // ─────────────────────────────────────────
  // ENTREGA DEL PRODUCTO
  // ─────────────────────────────────────────

  @Column({
    name: "deliverydate",
    type: "date",
    nullable: true,
  })
  deliveryDate!: string | null;

  // ─────────────────────────────────────────
  // AUDITORÍA
  // ─────────────────────────────────────────

  @CreateDateColumn({
    name: "created_at",
  })
  createdAt!: Date;

  @UpdateDateColumn({
    name: "updated_at",
  })
  updatedAt!: Date;
}
