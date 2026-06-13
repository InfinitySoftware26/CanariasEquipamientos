import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
} from 'typeorm';

@Entity('DELIVERY_ATTEMPTS')
export class DeliveryAttempt {
  @PrimaryGeneratedColumn('uuid', { name: 'delivery_attempt_id' })
  deliveryAttemptId!: string;

  @Column({ name: 'sale_id' })
  saleId!: string;

  @Column({ name: 'staff_id' })
  staffId!: string;

  @Column({ name: 'attempt_number', type: 'integer' })
  attemptNumber!: number;

  @Column({ type: 'text' })
  reason!: string;

  @Column({ name: 'attempted_at', type: 'timestamptz' })
  attemptedAt!: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
