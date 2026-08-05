import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsController } from './controllers/notifications.controller';
import { NotificationsService } from './services/notifications.service';
import { NotificationsRepository } from './repositories/notifications.repository';
import { Notification } from './entities/notification.entity';
import { NOTIFICATIONS_REPOSITORY } from './interfaces/notifications-repository.interface';
import { NotificationDeliveriesModule } from '../notification-deliveries/notification-deliveries.module';

@Module({
  imports: [TypeOrmModule.forFeature([Notification]), NotificationDeliveriesModule],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    { provide: NOTIFICATIONS_REPOSITORY, useClass: NotificationsRepository },
  ],
  exports: [NotificationsService],
})
export class NotificationsModule {}
