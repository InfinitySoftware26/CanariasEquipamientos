import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { DailyClosureStatus } from "../../../common/enums/daily-closure-status.enum";
import { Staff } from "@modules/staff/entities/staff.entity";

@Entity("DAILY_CLOSURES")
export class DailyClosure {
  @PrimaryGeneratedColumn("uuid", { name: "closure_id" })
  closureId!: string;

  @Column({ name: "staff_id", type: "uuid" })
  staffId!: string;

  @ManyToOne(() => Staff, { nullable: false })
  @JoinColumn({ name: "staff_id" })
  staff!: Staff;

  @Column({ name: "validated_by", type: "uuid", nullable: true })
  validatedBy!: string;

  @Column({ name: "society_id", type: "uuid" })
  societyId!: string;

  @Column({ name: "closing_date", type: "date" })
  closingDate!: Date;

  @Column({ name: "total_collected", type: "decimal", precision: 12, scale: 2 })
  totalCollected!: number;

  @Column({
    type: "enum",
    enum: DailyClosureStatus,
    default: DailyClosureStatus.PENDING,
  })
  status!: DailyClosureStatus;

  @Column({ nullable: true })
  notes!: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
