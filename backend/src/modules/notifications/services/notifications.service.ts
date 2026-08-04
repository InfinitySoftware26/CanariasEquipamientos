import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { INotificationsRepository, NOTIFICATIONS_REPOSITORY } from '../interfaces/notifications-repository.interface';
import { Notification } from '../entities/notification.entity';
import { CreateNotificationDto } from '../dto/create-notification.dto';
import { NotificationDeliveriesService } from '../../notification-deliveries/services/notification-deliveries.service';
import { JwtPayload } from '../../auth/interfaces/jwt-payload.interface';

@Injectable()
export class NotificationsService {
  constructor(
    @Inject(NOTIFICATIONS_REPOSITORY)
    private readonly notificationsRepo: INotificationsRepository,
    private readonly deliveriesService: NotificationDeliveriesService,
  ) {}

  async findById(id: string): Promise<Notification> {
    const notification = await this.notificationsRepo.findById(id);
    if (!notification) throw new NotFoundException(`Notificación ${id} no encontrada`);
    return notification;
  }

  findBySociety(societyId: string): Promise<Notification[]> {
    return this.notificationsRepo.findBySociety(societyId);
  }

  async create(dto: CreateNotificationDto, user: JwtPayload): Promise<Notification> {
    const notification = await this.notificationsRepo.create({
      societyId: user.societyId,
      type: dto.type,
      title: dto.title,
      message: dto.message,
      relatedEntityType: dto.relatedEntityType,
      relatedEntityId: dto.relatedEntityId,
    });

    await this.deliveriesService.createForRecipients(notification.notificationId, dto.recipientStaffIds);

    return notification;
  }

  /**
   * Punto de integración interno: usado por otros módulos (cierres, ventas, pagos)
   * para emitir notificaciones de eventos del sistema sin pasar por el controller.
   */
  async notify(params: {
    societyId: string;
    type: Notification['type'];
    title: string;
    message: string;
    recipientStaffIds: string[];
    relatedEntityType?: string;
    relatedEntityId?: string;
  }): Promise<Notification> {
    const notification = await this.notificationsRepo.create({
      societyId: params.societyId,
      type: params.type,
      title: params.title,
      message: params.message,
      relatedEntityType: params.relatedEntityType,
      relatedEntityId: params.relatedEntityId,
    });

    await this.deliveriesService.createForRecipients(notification.notificationId, params.recipientStaffIds);

    return notification;
  }
}
