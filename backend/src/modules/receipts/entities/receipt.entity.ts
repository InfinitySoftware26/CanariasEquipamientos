import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('RECEIPTS')
export class Receipt {
  @PrimaryGeneratedColumn('uuid', { name: 'receipt_id' })
  receiptId!: string;

  @Column({ name: 'society_id', type: 'uuid' })
  societyId!: string;

  @Column({ name: 'receipt_number', type: 'integer' })
  receiptNumber!: number;

  @Column({ name: 'payment_id', type: 'uuid', nullable: true })
  paymentId!: string;

  @Column({ name: 'supplier_payment_id', type: 'uuid', nullable: true })
  supplierPaymentId!: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount!: number;

  @Column({ name: 'issued_at', type: 'timestamptz' })
  issuedAt!: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
