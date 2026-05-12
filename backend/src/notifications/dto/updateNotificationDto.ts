export class UpdateNotificationDto {
  status?: 'pending' | 'sent' | 'read';
  sentAt?: Date;
  readAt?: Date;
}
