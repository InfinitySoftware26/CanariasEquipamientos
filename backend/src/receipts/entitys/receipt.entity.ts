// @Entity('receipts')
// export class Receipt {
//   @PrimaryGeneratedColumn()
//   id: number;

//   @OneToOne(() => Payment, (payment) => payment.receipt)
//   payment: Payment; // pago asociado

//   @Column()
//   receiptNumber: string; // número de comprobante

//   @CreateDateColumn({ type: 'timestamp' })
//   issuedAt: Date; // fecha de emisión
// }
