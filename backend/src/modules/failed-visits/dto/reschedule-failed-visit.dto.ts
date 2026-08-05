import { IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RescheduleFailedVisitDto {
  @ApiProperty({ example: '2026-08-10', description: 'Nueva fecha propuesta para reintentar la visita (YYYY-MM-DD)' })
  @IsDateString()
  rescheduledDate!: string;
}
