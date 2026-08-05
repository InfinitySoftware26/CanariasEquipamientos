import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationDelivery } from '../entities/notification-delivery.entity';
import { INotificationDeliveriesRepository } from '../interfaces/notification-deliveries-repository.interface';
import { NotificationDeliveryStatus } from '../../../common/enums/notification-delivery-status.enum';

@Injectable()
export class NotificationDeliveriesRepository implements INotificationDeliveriesRepository {
  constructor(
    @InjectRepository(NotificationDelivery) private readonly repo: Repository<NotificationDelivery>,
  ) {}

  async create(data: Partial<NotificationDelivery>): Promise<NotificationDelivery> {
    return this.repo.save(this.repo.create(data));
  }

  async createMany(data: Partial<NotificationDelivery>[]): Promise<NotificationDelivery[]> {
    if (!data.length) return [];
    return this.repo.save(data.map(d => this.repo.create(d)));
  }

  findById(id: string): Promise<NotificationDelivery | null> {
    return this.repo.findOne({ where: { deliveryId: id } });
  }

  findByStaff(staffId: string, status?: NotificationDeliveryStatus): Promise<NotificationDelivery[]> {
    return this.repo.find({
      where: { staffId, ...(status ? { status } : {}) },
      order: { createdAt: 'DESC' },
    });
  }

  async updateStatus(id: string, status: NotificationDeliveryStatus): Promise<void> {
    const updates: Partial<NotificationDelivery> = { status };
    if (status === NotificationDeliveryStatus.SENT) updates.sentAt = new Date();
    if (status === NotificationDeliveryStatus.READ) updates.readAt = new Date();
    await this.repo.update({ deliveryId: id }, updates);
  }
}
