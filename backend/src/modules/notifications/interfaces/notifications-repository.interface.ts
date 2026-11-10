import { Notification } from '../entities/notification.entity';

export interface INotificationsRepository {
  create(data: Partial<Notification>): Promise<Notification>;
  /** societyId opcional: si se pasa, filtra por sociedad en la consulta. */
  findById(id: string, societyId?: string): Promise<Notification | null>;
  findBySociety(societyId: string): Promise<Notification[]>;
}

export const NOTIFICATIONS_REPOSITORY = 'INotificationsRepository';
