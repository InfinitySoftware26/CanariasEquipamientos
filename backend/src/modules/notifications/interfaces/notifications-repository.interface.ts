import { Notification } from '../entities/notification.entity';

export interface INotificationsRepository {
  create(data: Partial<Notification>): Promise<Notification>;
  findById(id: string): Promise<Notification | null>;
  findBySociety(societyId: string): Promise<Notification[]>;
}

export const NOTIFICATIONS_REPOSITORY = 'INotificationsRepository';
