import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('SUPPLIER_INVOICE_PAYMENT_APPLICATIONS')
export class SupplierInvoicePaymentApplication {
  @PrimaryGeneratedColumn('uuid', { name: 'application_id' })
  applicationId!: string;

  @Column({ name: 'supplier_payment_id', type: 'uuid' })
  supplierPaymentId!: string;

  @Column({ name: 'supplier_invoice_id', type: 'uuid' })
  supplierInvoiceId!: string;

  @Column({ name: 'applied_amount', type: 'decimal', precision: 12, scale: 2 })
  appliedAmount!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
