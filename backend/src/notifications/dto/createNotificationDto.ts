export enum NotificationType {
  INFO = 'INFORMATION',
  WARNING = 'WARNING',
  ALERT = 'ALERT',
  PAYMENT_REMINDER = 'PAYMENT_REMINDER',
}

export enum NotificationChannel {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  WHATSAPP = 'WHATSAPP',
}

export class CreateNoftificationDto {
  title: string;
  message: string;
  type: NotificationType;
  clientId: number;
  channel: NotificationChannel;
}
