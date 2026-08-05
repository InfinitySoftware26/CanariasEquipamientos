import { NotificationDelivery } from '../entities/notification-delivery.entity';
import { NotificationDeliveryStatus } from '../../../common/enums/notification-delivery-status.enum';

export interface INotificationDeliveriesRepository {
  create(data: Partial<NotificationDelivery>): Promise<NotificationDelivery>;
  createMany(data: Partial<NotificationDelivery>[]): Promise<NotificationDelivery[]>;
  findById(id: string): Promise<NotificationDelivery | null>;
  findByStaff(staffId: string, status?: NotificationDeliveryStatus): Promise<NotificationDelivery[]>;
  updateStatus(id: string, status: NotificationDeliveryStatus): Promise<void>;
}

export const NOTIFICATION_DELIVERIES_REPOSITORY = 'INotificationDeliveriesRepository';
