import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn,
} from 'typeorm';
import { CashboxStatus } from '../../../common/enums/cashbox-status.enum';

@Entity('CASHBOX')
export class Cashbox {
  @PrimaryGeneratedColumn('uuid', { name: 'cashbox_id' })
  cashboxId!: string;

  @Column({ name: 'society_id', type: 'uuid' })
  societyId!: string;

  @Column({ name: 'staff_id', type: 'uuid' })
  staffId!: string;

  @Column({ name: 'opening_date', type: 'date' })
  openingDate!: Date;

  @Column({ name: 'opening_balance', type: 'decimal', precision: 12, scale: 2 })
  openingBalance!: number;

  @Column({ name: 'closing_balance', type: 'decimal', precision: 12, scale: 2, nullable: true })
  closingBalance!: number;

  @Column({ type: 'enum', enum: CashboxStatus, default: CashboxStatus.OPEN })
  status!: CashboxStatus;

  @Column({ name: 'closed_at', type: 'timestamptz', nullable: true })
  closedAt!: Date;

  @Column({ nullable: true })
  notes!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
