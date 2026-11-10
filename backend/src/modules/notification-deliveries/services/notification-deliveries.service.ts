import { Injectable, Inject, NotFoundException } from '@nestjs/common';
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

  /**
   * La entrega se busca filtrando por destinatario en la consulta: una entrega
   * de otro usuario (y por lo tanto de cualquier otra sociedad) responde 404,
   * sin revelar su existencia. La bandeja es personal, por lo que SUPER_ADMIN
   * tampoco puede marcar como leída una entrega ajena.
   */
  async markAsRead(id: string, user: JwtPayload): Promise<void> {
    const delivery = await this.deliveriesRepo.findByIdForStaff(id, user.sub);
    if (!delivery) throw new NotFoundException(`Entrega de notificación ${id} no encontrada`);
    await this.deliveriesRepo.updateStatus(id, NotificationDeliveryStatus.READ);
  }
}
