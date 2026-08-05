import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationDeliveriesController } from './controllers/notification-deliveries.controller';
import { NotificationDeliveriesService } from './services/notification-deliveries.service';
import { NotificationDeliveriesRepository } from './repositories/notification-deliveries.repository';
import { NotificationDelivery } from './entities/notification-delivery.entity';
import { NOTIFICATION_DELIVERIES_REPOSITORY } from './interfaces/notification-deliveries-repository.interface';

@Module({
  imports: [TypeOrmModule.forFeature([NotificationDelivery])],
  controllers: [NotificationDeliveriesController],
  providers: [
    NotificationDeliveriesService,
    { provide: NOTIFICATION_DELIVERIES_REPOSITORY, useClass: NotificationDeliveriesRepository },
  ],
  exports: [NotificationDeliveriesService],
})
export class NotificationDeliveriesModule {}
