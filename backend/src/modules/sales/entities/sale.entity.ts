import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn,
} from 'typeorm';
import { SaleStatus } from '../../../common/enums/sale-status.enum';
import { PaymentFrequency } from '../../../common/enums/payment-frequency.enum';

@Entity('SALES')
export class Sale {
  @PrimaryGeneratedColumn('uuid', { name: 'sale_id' })
  saleId!: string;

  @Column({ name: 'client_id' })
  clientId!: string;

  @Column({ name: 'staff_id' })
  staffId!: string;

  @Column({ name: 'society_id' })
  societyId!: string;

  @Column({ name: 'total_amount', type: 'decimal', precision: 12, scale: 2 })
  totalAmount!: number;

  @Column({ name: 'installment_amount', type: 'decimal', precision: 12, scale: 2 })
  installmentAmount!: number;

  @Column({ name: 'installments_count', type: 'integer' })
  installmentsCount!: number;

  @Column({ name: 'payment_frequency', type: 'enum', enum: PaymentFrequency })
  paymentFrequency!: PaymentFrequency;

  @Column({ name: 'first_due_date', type: 'date' })
  firstDueDate!: Date;

  @Column({ name: 'sale_date', type: 'timestamptz' })
  saleDate!: Date;

  @Column({
    type: 'enum',
    enum: SaleStatus,
    default: SaleStatus.PENDING_ADMIN_VALIDATION,
  })
  status!: SaleStatus;

  @Column({ name: 'assigned_collector_id', nullable: true })
  assignedCollectorId!: string;

  @Column({ nullable: true })
  observation!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
