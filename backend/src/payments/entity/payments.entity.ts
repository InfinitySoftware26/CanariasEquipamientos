// @Entity('payments')
// export class Payment {
//   @PrimaryGeneratedColumn()
//   id: number;

//   @ManyToOne(() => Installment, (installment) => installment.payments, { onDelete: 'CASCADE' })
//   installment: Installment; // cuota que se está pagando

//   @Column({ type: 'decimal', precision: 10, scale: 2 })
//   amount: number; // monto pagado

//   @Column({ type: 'enum', enum: ['CASH', 'BANK_TRANSFER', 'CARD'] })
//   method: 'CASH' | 'BANK_TRANSFER' | 'CARD'; // método de pago

//   @CreateDateColumn({ type: 'timestamp' })
//   paidAt: Date; // fecha del pago

//   @OneToOne(() => Receipt, (receipt) => receipt.payment)
//   receipt: Receipt; // comprobante generado
// }
