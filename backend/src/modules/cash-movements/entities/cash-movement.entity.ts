import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { CashMovementType } from '../../../common/enums/cash-movement-type.enum';

@Entity('CASH_MOVEMENTS')
export class CashMovement {
  @PrimaryGeneratedColumn('uuid', { name: 'movement_id' })
  movementId!: string;

  @Column({ name: 'cashbox_id', type: 'uuid' })
  cashboxId!: string;

  @Column({ name: 'society_id', type: 'uuid' })
  societyId!: string;

  @Column({ name: 'staff_id', type: 'uuid' })
  staffId!: string;

  @Column({ type: 'enum', enum: CashMovementType })
  type!: CashMovementType;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount!: number;

  @Column()
  concept!: string;

  @Column({ name: 'related_payment_id', type: 'uuid', nullable: true })
  relatedPaymentId!: string;

  @Column({ name: 'related_supplier_payment_id', type: 'uuid', nullable: true })
  relatedSupplierPaymentId!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
