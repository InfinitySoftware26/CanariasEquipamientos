// // cashbox-movement.entity.ts
// import {
//   Entity,
//   PrimaryGeneratedColumn,
//   Column,
//   ManyToOne,
//   JoinColumn,
//   CreateDateColumn,
// } from 'typeorm';

// import { Cashbox } from '../../cashbox/entiti/cashbox.entiti';
// import { CashboxMovementType } from '../dto/createCashMovementDto';
// import { CashboxMovementCategory } from '../dto/createCashMovementDto';

// @Entity('cashbox_movements')
// export class CashboxMovement {
//   @PrimaryGeneratedColumn()
//   id: number;
//   // Identificador único autogenerado por la base de datos

//   @Column({
//     type: 'enum',
//     enum: CashboxMovementType,
//   })
//   type: CashboxMovementType;
//   // Tipo de movimiento: INGRESO o EGRESO

//   @Column({ type: 'decimal', precision: 10, scale: 2 })
//   amount: number;
//   // Monto del movimiento con precisión para dinero

//   @Column({
//     type: 'enum',
//     enum: CashboxMovementCategory,
//   })
//   category: CashboxMovementCategory;
//   // Categoría: PAGO A PROVEEDOR, GASTO o INSUMO

//   @Column()
//   societyId: number;
//   // Sociedad a la que corresponde el movimiento

//   @Column()
//   staffId: number;
//   // Usuario/staff que realizó el movimiento (se obtiene del contexto de autenticación)

//   @ManyToOne(() => Cashbox, (cashbox) => cashbox.movements, {
//     onDelete: 'CASCADE',
//   })
//   @JoinColumn({ name: 'cashbox_id' })
//   cashbox: Cashbox;
//   // Relación con la caja correspondiente

//   @CreateDateColumn({ type: 'timestamp' })
//   createdAt: Date;
//   // Fecha de creación del movimiento, generada automáticamente
// }
