import { Injectable } from '@nestjs/common';
import { UpdateNotificationDto } from './dto/updateNotificationDto';

@Injectable()
export class NotificationRepository {
  getAllNotifications() {
    return 'este metodo trae todas las notificaciones';
  }
  getNotificationById(id: string) {
    return 'este metodo trae una notificacion';
  }
  getNotificationBySaleId(saleId: string) {
    return 'este metodo devuelve las notificaciones de un cliente puntual';
  }
  createNotification(notificationCreateData) {
    return 'este metodo crea una notificacion';
  }
  updateNotification(id: string, dataUpdate: UpdateNotificationDto) {
    return 'este metodo actualiza el estado de una notificacion';
  }
}
