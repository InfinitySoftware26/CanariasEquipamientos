import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from "typeorm";

export enum StaffSocietyStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
}

@Entity("STAFF_SOCIETIES")
export class StaffSociety {
  @PrimaryGeneratedColumn("uuid", { name: "staff_society_id" })
  staffSocietyId!: string;

  @Column({ name: "staff_id", type: "uuid" })
  staffId!: string;

  @Column({ name: "society_id", type: "uuid" })
  societyId!: string;

  @Column({
    type: "enum",
    enum: StaffSocietyStatus,
    default: StaffSocietyStatus.ACTIVE,
  })
  status!: StaffSocietyStatus;

  @CreateDateColumn({ name: "assigned_at" })
  assignedAt!: Date;
}
