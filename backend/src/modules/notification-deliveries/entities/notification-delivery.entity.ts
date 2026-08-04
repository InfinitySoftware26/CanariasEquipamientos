import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn,
} from 'typeorm';
import { NotificationDeliveryStatus } from '../../../common/enums/notification-delivery-status.enum';

@Entity('NOTIFICATION_DELIVERIES')
export class NotificationDelivery {
  @PrimaryGeneratedColumn('uuid', { name: 'delivery_id' })
  deliveryId!: string;

  @Column({ name: 'notification_id', type: 'uuid' })
  notificationId!: string;

  @Column({ name: 'staff_id', type: 'uuid' })
  staffId!: string;

  @Column({ type: 'enum', enum: NotificationDeliveryStatus, default: NotificationDeliveryStatus.PENDING })
  status!: NotificationDeliveryStatus;

  @Column({ name: 'sent_at', type: 'timestamptz', nullable: true })
  sentAt!: Date;

  @Column({ name: 'read_at', type: 'timestamptz', nullable: true })
  readAt!: Date;

  @Column({ name: 'retry_count', type: 'integer', default: 0 })
  retryCount!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
