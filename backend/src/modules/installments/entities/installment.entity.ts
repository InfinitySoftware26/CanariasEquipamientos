import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn,
} from 'typeorm';
import { InstallmentStatus } from '../../../common/enums/installment-status.enum';
import { PaymentFrequency } from '../../../common/enums/payment-frequency.enum';

@Entity('INSTALLMENTS')
export class Installment {
  @PrimaryGeneratedColumn('uuid', { name: 'installment_id' })
  installmentId!: string;

  @Column({ name: 'sale_id', type: 'uuid' })
  saleId!: string;

  @Column({ name: 'client_id', type: 'uuid' })
  clientId!: string;

  @Column({ name: 'society_id', type: 'uuid' })
  societyId!: string;

  @Column({ name: 'installment_number', type: 'integer' })
  installmentNumber!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount!: number;

  @Column({ name: 'paid_amount', type: 'decimal', precision: 12, scale: 2, default: 0 })
  paidAmount!: number;

  @Column({ name: 'remaining_amount', type: 'decimal', precision: 12, scale: 2 })
  remainingAmount!: number;

  @Column({ name: 'due_date', type: 'date' })
  dueDate!: Date;

  @Column({ name: 'payment_frequency', type: 'enum', enum: PaymentFrequency })
  paymentFrequency!: PaymentFrequency;

  @Column({ type: 'enum', enum: InstallmentStatus, default: InstallmentStatus.PENDING })
  status!: InstallmentStatus;

  @Column({ nullable: true })
  notes!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
