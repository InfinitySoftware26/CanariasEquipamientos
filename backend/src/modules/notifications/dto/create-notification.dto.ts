import { IsEnum, IsString, IsNotEmpty, IsOptional, IsUUID, IsArray, ArrayMinSize } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationType } from '../../../common/enums/notification-type.enum';

export class CreateNotificationDto {
  @ApiProperty({ enum: NotificationType, example: NotificationType.SYSTEM })
  @IsEnum(NotificationType)
  type!: NotificationType;

  @ApiProperty({ example: 'Cierre pendiente de validación' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ example: 'El cobrador Juan Pérez declaró un cierre diario que requiere validación.' })
  @IsString()
  @IsNotEmpty()
  message!: string;

  @ApiProperty({ type: [String], description: 'UUIDs del staff que debe recibir la notificación' })
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  recipientStaffIds!: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  relatedEntityType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  relatedEntityId?: string;
}
