// // import {
// //   Entity,
// //   PrimaryGeneratedColumn,
// //   Column,
// //   ManyToOne,
// //   JoinColumn,
// //   CreateDateColumn,
// //   UpdateDateColumn,
// // } from 'typeorm';
// // import { Staff } from '../../staff/entities/staff.entity';
// import { PaymentStatus } from '../enums/payment-status.enum';
// import { Currency } from '../enums/currency.enum';
// import { PaymentMethod } from '../enums/payment-method.enum';

// // @Entity('payment_suppliers')
// export class PaymentSupplier {
//   // Identificador único del pago
//   // @PrimaryGeneratedColumn()
//   id: number;

//   // Identificador del proveedor
//   // @Column()
//   supplierId: number;

//   // Fecha del pago
//   // @Column({ type: 'date' })
//   paymentDate: Date;

//   // Monto total del pago
//   // @Column({ type: 'decimal', precision: 12, scale: 2 })
//   totalAmount: number;

//   // Moneda en la que se realiza el pago
//   // @Column({ type: 'enum', enum: Currency, default: Currency.ARS })
//   currency: Currency;

//   // Forma o método de pago utilizado
//   // @Column({ type: 'enum', enum: PaymentMethod })
//   paymentMethod: PaymentMethod;

//   // Referencia bancaria o número de transacción
//   // @Column({ nullable: true })
//   bankReference?: string;

//   // Estado del pago (PENDING, PAID, CANCELLED, REJECTED)
//   // @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
//   paymentStatus: PaymentStatus;

//   // Personal responsable del pago (Staff)
//   // @Column()
//   responsibleStaffId: number;

//   // Observaciones o notas sobre el pago
//   // @Column({ type: 'text', nullable: true })
//   notes?: string;

//   // Ruta o URL del comprobante adjunto
//   // @Column({ nullable: true })
//   voucherAttachment?: string;

//   // Fecha de creación del registro
//   // @CreateDateColumn({ type: 'timestamp' })
//   createdAt: Date;

//   // Fecha de última actualización del registro
//   // @UpdateDateColumn({ type: 'timestamp' })
//   updatedAt: Date;
// }
