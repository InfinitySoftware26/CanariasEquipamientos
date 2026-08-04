import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../entities/notification.entity';
import { INotificationsRepository } from '../interfaces/notifications-repository.interface';

@Injectable()
export class NotificationsRepository implements INotificationsRepository {
  constructor(@InjectRepository(Notification) private readonly repo: Repository<Notification>) {}

  async create(data: Partial<Notification>): Promise<Notification> {
    return this.repo.save(this.repo.create(data));
  }

  findById(id: string): Promise<Notification | null> {
    return this.repo.findOne({ where: { notificationId: id } });
  }

  findBySociety(societyId: string): Promise<Notification[]> {
    return this.repo.find({ where: { societyId }, order: { createdAt: 'DESC' } });
  }
}
