import { Injectable } from '@nestjs/common';
import { CreateNoftificationDto } from './dto/createNotificationDto';
import { NotificationRepository } from './notifications.repository';
import { UpdateNotificationDto } from './dto/updateNotificationDto';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly notificationRepository: NotificationRepository,
  ) {}
  findAllNotificationsService() {
    return this.notificationRepository.getAllNotifications();
  }
  findNotificationByIdService(id: string) {
    return this.notificationRepository.getNotificationById(id);
  }
  getNotificationBySaleIdService(saleId: string) {
    return this.notificationRepository.getNotificationBySaleId(saleId);
  }
  createNotificationService(notificationCreateData: CreateNoftificationDto) {
    return this.notificationRepository.createNotification(notificationCreateData);
  }
  updateNotificationStatusService(
    id: string,
    dataUpdate: UpdateNotificationDto,
  ) {
    return this.notificationRepository.updateNotification(id,dataUpdate);
  }
}
