// // import {
// //   Entity,
// //   PrimaryGeneratedColumn,
// //   Column,
// //   ManyToOne,
// //   JoinColumn,
// //   CreateDateColumn,
// //   UpdateDateColumn,
// // } from 'typeorm';
// // import { Client } from '../../clients/entities/client.entity';
// // import { Staff } from '../../staff/entities/staff.entity';

// // @Entity('sales')
// export class Sale {
//   // Identificador único de la venta
//   // @PrimaryGeneratedColumn('uuid')
//   id: string;

//   // Cliente al que se le realiza la venta
//   // @Column()
//   clientId: string;

//   // Vendedor responsable de la operación
//   // @Column()
//   sellerId: string;

//   // Cobrador asignado a la venta
//   // @Column({ nullable: true })
//   collectorId?: string;

//   // Producto o servicio vendido
//   // @Column()
//   product: string;

//   // Número de cuotas de la venta
//   // @Column('int')
//   installments: number;

//   // Precio total de la venta
//   // @Column('decimal', { precision: 12, scale: 2 })
//   totalPrice: number;

//   // Fecha y hora de la venta
//   // @Column({ type: 'timestamp' })
//   date: Date;

//   // Estado de la venta (PENDING, PAID, CANCELLED, etc.)
//   // @Column({ default: 'PENDING' })
//   status: string;

//   // Fecha de creación del registro
//   // @CreateDateColumn({ type: 'timestamp' })
//   createdAt: Date;

//   // Fecha de última actualización del registro
//   // @UpdateDateColumn({ type: 'timestamp' })
//   updatedAt: Date;
// }
