import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn,
} from 'typeorm';
import { SupplierInvoiceStatus } from '../../../common/enums/supplier-invoice-status.enum';

@Entity('SUPPLIER_INVOICES')
export class SupplierInvoice {
  @PrimaryGeneratedColumn('uuid', { name: 'supplier_invoice_id' })
  supplierInvoiceId!: string;

  @Column({ name: 'society_id', type: 'uuid' })
  societyId!: string;

  @Column({ name: 'supplier_id', type: 'uuid' })
  supplierId!: string;

  @Column({ name: 'invoice_number' })
  invoiceNumber!: string;

  @Column({ name: 'issue_date', type: 'date' })
  issueDate!: string;

  @Column({ name: 'due_date', type: 'date', nullable: true })
  dueDate!: string;

  @Column({ name: 'total_amount', type: 'decimal', precision: 12, scale: 2 })
  totalAmount!: number;

  @Column({ type: 'enum', enum: SupplierInvoiceStatus, default: SupplierInvoiceStatus.PENDING })
  status!: SupplierInvoiceStatus;

  @Column({ nullable: true })
  notes!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
