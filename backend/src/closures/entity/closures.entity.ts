// import {
//   Entity,
//   PrimaryGeneratedColumn,
//   Column,
//   ManyToOne,
//   OneToMany,
//   CreateDateColumn,
// } from 'typeorm';
// import { Staff } from './staff.entity';
// import { Society } from './society.entity';
// import { Settlement } from './settlement.entity';

// @Entity('closures')
// export class Closure {
//   @PrimaryGeneratedColumn()
//   id: number;
//   // Identificador único del cierre

//   @ManyToOne(() => Staff, (staff) => staff.closures)
//   collector: Staff;
//   // Cobrador que realiza el cierre

//   @ManyToOne(() => Society, (society) => society.closures)
//   society: Society;
//   // Sociedad a la que corresponde el cierre

//   @Column({ type: 'decimal', precision: 10, scale: 2 })
//   totalCollected: number;
//   // Total recaudado en el día

//   @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
//   totalExpenses: number;
//   // Gastos del cobrador (viáticos, insumos)

//   @Column({ type: 'decimal', precision: 10, scale: 2 })
//   netAmount: number;
//   // Monto neto a rendir

//   @Column({ type: 'date' })
//   closureDate: Date;
//   // Fecha del cierre

//   @Column({ type: 'enum', enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' })
//   status: 'PENDING' | 'APPROVED' | 'REJECTED';
//   // Estado del cierre

//   @OneToMany(() => Settlement, (settlement) => settlement.closure)
//   settlements: Settlement[];
//   // Relación con rendiciones (pagos, depósitos)

//   @CreateDateColumn({ type: 'timestamp' })
//   createdAt: Date;
//   // Fecha de creación del registro

//   @Column({ nullable: true })
//   approvedBy: number;
//   // Staff que valida/aprueba el cierre
// }
