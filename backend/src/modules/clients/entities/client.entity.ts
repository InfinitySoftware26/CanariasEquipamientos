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

  @Column({ type: "text", nullable: true })
  observations?: string;

  @Column({ name: "zone_id", type: "uuid", nullable: true })
  zoneId?: string;

  @Column({ name: "society_id", type: "uuid", nullable: true })
  societyId?: string;

  @Column({ name: "created_by", nullable: true })
  createdBy?: string;

  @Column({ name: "updated_by", nullable: true })
  updatedBy?: string;

  @Column({ name: "verification_requested_by", nullable: true })
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
