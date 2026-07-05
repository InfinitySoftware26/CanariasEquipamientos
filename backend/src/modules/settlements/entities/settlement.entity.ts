import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn,
} from 'typeorm';
import { SettlementStatus } from '../../../common/enums/settlement-status.enum';

@Entity('SETTLEMENTS')
export class Settlement {
  @PrimaryGeneratedColumn('uuid', { name: 'settlement_id' })
  settlementId!: string;

  @Column({ name: 'closure_id', type: 'uuid' })
  closureId!: string;

  @Column({ name: 'staff_id', type: 'uuid' })
  staffId!: string;

  @Column({ name: 'society_id', type: 'uuid' })
  societyId!: string;

  @Column({ name: 'settlement_date', type: 'date' })
  settlementDate!: Date;

  @Column({ name: 'amount_due', type: 'decimal', precision: 12, scale: 2 })
  amountDue!: number;

  @Column({ name: 'amount_collected', type: 'decimal', precision: 12, scale: 2 })
  amountCollected!: number;

  @Column({ name: 'outstanding_debt', type: 'decimal', precision: 12, scale: 2 })
  outstandingDebt!: number;

  @Column({ type: 'enum', enum: SettlementStatus, default: SettlementStatus.PENDING })
  status!: SettlementStatus;

  @Column({ nullable: true })
  notes!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
