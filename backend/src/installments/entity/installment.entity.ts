// // import {
// //   Entity,
// //   PrimaryGeneratedColumn,
// //   Column,
// //   OneToMany,
// // } from 'typeorm';
// // import { Payment } from '../../payments/entities/payment.entity';
// import { InstallmentStatus } from '../enums/installment-status.enum';

// // @Entity('installments')
// export class Installment {
//   @PrimaryGeneratedColumn()
//   id: number; // Identificador único de la cuota

//   @Column()
//   societyId: number; // sociedad correspondiente

//   @Column()
//   customerId: number; // cliente asociado

//   @Column({ type: 'decimal', precision: 10, scale: 2 })
//   amount: number; // monto de la cuota

//   @Column({ type: 'date' })
//   dueDate: Date; // fecha de vencimiento

//   @Column({
//     type: 'enum',
//     enum: InstallmentStatus,
//     default: InstallmentStatus.PENDING,
//   })
//   status: InstallmentStatus; // Estado de la cuota

//   @OneToMany(() => Payment, (payment) => payment.installment)
//   payments: Payment[]; // pagos asociados
// }
