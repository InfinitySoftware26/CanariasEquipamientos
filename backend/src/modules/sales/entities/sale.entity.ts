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
import { Client } from "../../clients/entities/client.entity";
import { Staff } from "../../staff/entities/staff.entity";
import { SaleProduct } from "./sale-product.entity";

@Entity("SALES")
export class Sale {
  @PrimaryGeneratedColumn("uuid", { name: "sale_id" })
  saleId!: string;

  @Column({ name: "client_id", type: "uuid" })
  clientId!: string;

  @ManyToOne(() => Client)
  @JoinColumn({ name: "client_id" })
  client!: Client;

  @OneToMany(() => SaleProduct, (sp) => sp.sale)
  products!: SaleProduct[];

  @Column({ name: "staff_id", type: "uuid" })
  staffId!: string;

  @ManyToOne(() => Staff)
  @JoinColumn({ name: "staff_id" })
  staff!: Staff;

  @Column({ name: "society_id", type: "uuid" })
  societyId!: string;

  @Column({ name: "total_amount", type: "decimal", precision: 12, scale: 2 })
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

  @Column({ name: "installments_count", type: "integer" })
  installmentsCount!: number;

  @Column({ name: "payment_frequency", type: "enum", enum: PaymentFrequency })
  paymentFrequency!: PaymentFrequency;

  @Column({ name: "first_due_date", type: "date" })
  firstDueDate!: Date;

  @Column({ name: "sale_date", type: "timestamptz" })
  saleDate!: Date;

  @Column({
    type: "enum",
    enum: SaleStatus,
    default: SaleStatus.PENDING_ADMIN_VALIDATION,
  })
  status!: SaleStatus;

  @Column({ name: "assigned_collector_id", type: "uuid", nullable: true })
  assignedCollectorId!: string;

  @ManyToOne(() => Staff, { nullable: true })
  @JoinColumn({ name: "assigned_collector_id" })
  collector!: Staff;

  @Column({ nullable: true })
  observation!: string;

  @Column({
    name: "deliverydate",
    type: "date",
    nullable: true,
  })
  deliveryDate!: string | null;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
