// // import {
// //   Entity,
// //   PrimaryGeneratedColumn,
// //   Column,
// //   CreateDateColumn,
// //   UpdateDateColumn,
// // } from 'typeorm';

// import { StaffRole } from '../enums/staff-role.enum';

// // @Entity('staff')
// export class Staff {
//   // Identificador único del empleado
//   // @PrimaryGeneratedColumn('uuid')
//   id: string;

//   // Nombre del empleado
//   // @Column()
//   name: string;

//   // Apellido del empleado
//   // @Column()
//   lastName: string;

//   // Documento nacional de identidad
//   // @Column({ unique: true })
//   dni: number;

//   // Correo electrónico de contacto
//   // @Column({ unique: true })
//   email: string;

//   // Rol interno del empleado (vendedor, cobrador, gerente, etc.)
//   // @Column()
//   role: StaffRole;

//   // Dirección del empleado
//   // @Column({ nullable: true })
//   address: string;

//   // Fecha de creación del registro
//   // @CreateDateColumn({ type: 'timestamp' })
//   createdAt: Date;

//   // Fecha de última actualización del registro
//   // @UpdateDateColumn({ type: 'timestamp' })
//   updatedAt: Date;
// }
