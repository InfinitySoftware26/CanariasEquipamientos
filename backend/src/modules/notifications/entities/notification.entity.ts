import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { NotificationType } from '../../../common/enums/notification-type.enum';

@Entity('NOTIFICATIONS')
export class Notification {
  @PrimaryGeneratedColumn('uuid', { name: 'notification_id' })
  notificationId!: string;

  @Column({ name: 'society_id', type: 'uuid' })
  societyId!: string;

  @Column({ type: 'enum', enum: NotificationType, default: NotificationType.SYSTEM })
  type!: NotificationType;

  @Column()
  title!: string;

  @Column({ type: 'text' })
  message!: string;

  @Column({ name: 'related_entity_type', nullable: true })
  relatedEntityType!: string;

  @Column({ name: 'related_entity_id', type: 'uuid', nullable: true })
  relatedEntityId!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
