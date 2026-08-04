import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import {
  INotificationDeliveriesRepository, NOTIFICATION_DELIVERIES_REPOSITORY,
} from '../interfaces/notification-deliveries-repository.interface';
import { NotificationDelivery } from '../entities/notification-delivery.entity';
import { NotificationDeliveryStatus } from '../../../common/enums/notification-delivery-status.enum';
import { JwtPayload } from '../../auth/interfaces/jwt-payload.interface';

@Injectable()
export class NotificationDeliveriesService {
  constructor(
    @Inject(NOTIFICATION_DELIVERIES_REPOSITORY)
    private readonly deliveriesRepo: INotificationDeliveriesRepository,
  ) {}

  findForStaff(staffId: string, status?: NotificationDeliveryStatus): Promise<NotificationDelivery[]> {
    return this.deliveriesRepo.findByStaff(staffId, status);
  }

  createForRecipients(notificationId: string, staffIds: string[]): Promise<NotificationDelivery[]> {
    return this.deliveriesRepo.createMany(
      staffIds.map(staffId => ({ notificationId, staffId, status: NotificationDeliveryStatus.SENT, sentAt: new Date() })),
    );
  }

  async markAsRead(id: string, user: JwtPayload): Promise<void> {
    const delivery = await this.deliveriesRepo.findById(id);
    if (!delivery) throw new NotFoundException(`Entrega de notificación ${id} no encontrada`);
    if (delivery.staffId !== user.sub) {
      throw new ForbiddenException('No podés marcar como leída una notificación de otro usuario');
    }
    await this.deliveriesRepo.updateStatus(id, NotificationDeliveryStatus.READ);
  }
}
