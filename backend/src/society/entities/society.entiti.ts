// import { Entity, PrimaryGeneratedColumn, Column, OneToOne, OneToMany } from 'typeorm';
// import { Cashbox } from './cashbox.entity';
// import { CashboxMovement } from './cashbox-movement.entity';

// @Entity('societies')
// export class Society {
//   @PrimaryGeneratedColumn()
//   id: number;
//   // Identificador único de la sociedad

//   @Column({ unique: true })
//   name: string;
//   // Nombre de la sociedad

//   @Column({ nullable: true })
//   taxId: string;
//   // CUIT o identificador fiscal (opcional)

//   @Column({ nullable: true })
//   address: string;
//   // Dirección de la sociedad (opcional)

//   @OneToOne(() => Cashbox, (cashbox) => cashbox.society)
//   cashbox: Cashbox;
//   // Relación 1:1 con la caja

//   @OneToMany(() => CashboxMovement, (movement) => movement.society)
//   movements: CashboxMovement[];
//   // Relación 1:N con los movimientos
// }
