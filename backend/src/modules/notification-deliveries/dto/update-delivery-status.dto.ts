import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { NotificationDeliveryStatus } from '../../../common/enums/notification-delivery-status.enum';

export class UpdateDeliveryStatusDto {
  @ApiProperty({ enum: NotificationDeliveryStatus, example: NotificationDeliveryStatus.READ })
  @IsEnum(NotificationDeliveryStatus)
  status!: NotificationDeliveryStatus;
}
