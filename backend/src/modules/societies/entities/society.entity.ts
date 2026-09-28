import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

export enum SocietyStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
}

@Entity("SOCIETYS")
export class Society {
  @PrimaryGeneratedColumn("uuid", {
    name: "society_id",
  })
  societyId!: string;

  @Column({
    unique: true,
  })
  name!: string;

  @Column({
    name: "business_name",
  })
  businessName!: string;

  @Column({
    name: "tax_id",
    unique: true,
  })
  taxId!: string;

  @Column({
    nullable: true,
  })
  address!: string;

  @Column({
    nullable: true,
  })
  phone!: string;

  @Column({
    nullable: true,
  })
  email!: string;

  @Column({
    type: "enum",
    enum: SocietyStatus,
    default: SocietyStatus.ACTIVE,
  })
  status!: SocietyStatus;

  @Column({
    name: "default_daily_late_interest_rate",
    type: "numeric",
    precision: 12,
    scale: 6,
    default: 0,
  })
  defaultDailyLateInterestRate!: number;

  @CreateDateColumn({
    name: "created_at",
  })
  createdAt!: Date;

  @UpdateDateColumn({
    name: "updated_at",
  })
  updatedAt!: Date;
}
