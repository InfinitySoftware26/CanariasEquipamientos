import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SelectSocietyDto {
  @ApiProperty({ example: '244a08c8-b2f3-4762-ba4d-2f6c8841eba3' })
  @IsUUID()
  societyId!: string;
}
