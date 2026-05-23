import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { SaleStatus } from '../../../common/enums/sale-status.enum';
import { PaymentMethod } from '../../../common/enums/payment-method.enum';

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

  @Column({ name: 'payment_type', type: 'enum', enum: PaymentMethod })
  paymentType!: PaymentMethod;

  @Column({ name: 'total_amount', type: 'decimal', precision: 10, scale: 2 })
  totalAmount!: number;

  @Column({ name: 'sale_date', type: 'timestamp' })
  saleDate!: Date;

  @Column({ type: 'enum', enum: SaleStatus, default: SaleStatus.PENDING })
  status!: SaleStatus;

  @Column({ nullable: true })
  observation!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
