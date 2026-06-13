import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignCollectorDto {
  @ApiProperty({ description: 'UUID del collector a asignar' })
  @IsUUID()
  collectorId!: string;
}
