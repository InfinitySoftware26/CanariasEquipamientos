import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

import { InstallmentStatus } from "../../../common/enums/installment-status.enum";
import { PaymentFrequency } from "../../../common/enums/payment-frequency.enum";

@Entity("INSTALLMENTS")
export class Installment {
  @PrimaryGeneratedColumn("uuid", {
    name: "installment_id",
  })
  installmentId!: string;

  @Column({
    name: "sale_id",
    type: "uuid",
  })
  saleId!: string;

  @Column({
    name: "client_id",
    type: "uuid",
  })
  clientId!: string;

  @Column({
    name: "society_id",
    type: "uuid",
  })
  societyId!: string;

  @Column({
    name: "installment_number",
    type: "integer",
  })
  installmentNumber!: number;

  @Column({
    type: "decimal",
    precision: 12,
    scale: 2,
  })
  amount!: number;

  @Column({
    name: "paid_amount",
    type: "decimal",
    precision: 12,
    scale: 2,
    default: 0,
  })
  paidAmount!: number;

  @Column({
    name: "remaining_amount",
    type: "decimal",
    precision: 12,
    scale: 2,
  })
  remainingAmount!: number;

  @Column({
    name: "due_date",
    type: "date",
  })
  dueDate!: Date;

  @Column({
    name: "payment_frequency",
    type: "enum",
    enum: PaymentFrequency,
  })
  paymentFrequency!: PaymentFrequency;

  @Column({
    type: "enum",
    enum: InstallmentStatus,
    default: InstallmentStatus.PENDING,
  })
  status!: InstallmentStatus;

  @Column({
    type: "text",
    nullable: true,
  })
  notes!: string | null;

  // ─────────────────────────────────────────────
  // MORA
  // ─────────────────────────────────────────────

  /**
   * Tasa diaria de interés por mora.
   *
   * Ejemplo:
   * 0.002 = 0,2% diario.
   */
  @Column({
    name: "daily_late_interest_rate",
    type: "decimal",
    precision: 7,
    scale: 6,
    default: 0,
  })
  dailyLateInterestRate!: number;

  /**
   * Interés por mora calculado hasta
   * lateInterestCalculatedAt.
   */
  @Column({
    name: "late_interest_amount",
    type: "decimal",
    precision: 12,
    scale: 2,
    default: 0,
  })
  lateInterestAmount!: number;

  @Column({
    name: "late_interest_calculated_at",
    type: "date",
    nullable: true,
  })
  lateInterestCalculatedAt!: Date | null;

  // ─────────────────────────────────────────────
  // REFINANCIACIÓN
  // ─────────────────────────────────────────────

  /**
   * Indica que el saldo de esta cuota fue
   * absorbido por una refinanciación.
   *
   * La cuota NO se elimina para conservar
   * el historial.
   */
  @Column({
    name: "is_refinanced",
    type: "boolean",
    default: false,
  })
  isRefinanced!: boolean;

  @Column({
    name: "refinanced_at",
    type: "timestamptz",
    nullable: true,
  })
  refinancedAt!: Date | null;

  /**
   * Identificador común para las cuotas originales
   * y las nuevas cuotas de una misma refinanciación.
   */
  @Column({
    name: "refinancing_group_id",
    type: "uuid",
    nullable: true,
  })
  refinancingGroupId!: string | null;

  @CreateDateColumn({
    name: "created_at",
  })
  createdAt!: Date;

  @UpdateDateColumn({
    name: "updated_at",
  })
  updatedAt!: Date;
}
