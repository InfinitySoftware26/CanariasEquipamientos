import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from "typeorm";

@Entity("PAYMENT_INSTALLMENT_APPLICATIONS")
export class PaymentInstallmentApplication {
  @PrimaryGeneratedColumn("uuid", { name: "application_id" })
  applicationId!: string;

  @Column({ name: "payment_id", type: "uuid" })
  paymentId!: string;

  @Column({ name: "installment_id", type: "uuid" })
  installmentId!: string;

  @Column({ name: "applied_amount", type: "decimal", precision: 12, scale: 2 })
  appliedAmount!: number;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;
}
