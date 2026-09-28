import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("CLIENT")
export class Client {
  @PrimaryGeneratedColumn("uuid", { name: "client_id" })
  clientId!: string;

  @Column({ nullable: true })
  name?: string;

  @Column({ nullable: true })
  surname?: string;

  @Column({ name: "document_number", nullable: true })
  documentNumber?: string;

  @Column({ nullable: true })
  address?: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ nullable: true })
  profession?: string;

  @Column({ name: "monthly_income", nullable: true })
  monthlyIncome?: string;

  @Column({ name: "payment_method", nullable: true })
  paymentMethod?: string;

  @Column({ name: "income_dependents", nullable: true })
  incomeDependents?: string;

  @Column({ name: "additional_income", nullable: true })
  additionalIncome?: string;

  @Column({ name: "housing_situation", nullable: true })
  housingSituation?: string;

  @Column({ name: "contract_duration", nullable: true })
  contractDuration?: string;

  @Column({ nullable: true })
  cuil?: string;

  @Column({ name: "active_credit", type: "boolean", default: false })
  activeCredit!: boolean;

  @Column({ name: "support_dni", default: false })
  supportDni!: boolean;

  @Column({ name: "support_bill", default: false })
  supportBill!: boolean;

  @Column({ name: "support_visit", default: false })
  supportVisit!: boolean;

  @Column({ name: "visit_name", nullable: true })
  visitName?: string;

  @Column({ name: "visit_date", type: "timestamptz", nullable: true })
  visitDate?: Date;

  @Column({ name: "name_reference1", type: "text", default: "" })
  nameReference1!: string;

  @Column({ name: "tel_reference1", type: "text", default: "" })
  telReference1!: string;

  @Column({ name: "address_reference1", type: "text", default: "" })
  addressReference1!: string;

  @Column({ name: "name_reference2", type: "text", default: "" })
  nameReference2!: string;

  @Column({ name: "tel_reference2", type: "text", default: "" })
  telReference2!: string;

  @Column({ name: "address_reference2", type: "text", default: "" })
  addressReference2!: string;

  @Column({ type: "text", nullable: true })
  observations?: string;

  @Column({ name: "zone_id", type: "uuid", nullable: true })
  zoneId?: string;

  @Column({ name: "society_id", type: "uuid", nullable: true })
  societyId?: string;

  @Column({ name: "created_by", type: "uuid", nullable: true })
  createdBy?: string;

  @Column({ name: "updated_by", type: "uuid", nullable: true })
  updatedBy?: string;

  @Column({ name: "verification_requested_by", type: "uuid", nullable: true })
  verificationRequestedBy?: string;

  @Column({ name: "verification_requested_by_name", nullable: true })
  verificationRequestedByName?: string;

  @Column({
    name: "verification_requested_at",
    type: "timestamptz",
    nullable: true,
  })
  verificationRequestedAt?: Date;

  @Column({ name: "verification_note", type: "text", nullable: true })
  verificationNote?: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
