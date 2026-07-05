import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSettlementDto {
  @ApiProperty({ description: 'UUID del cierre diario ya validado' })
  @IsUUID()
  closureId!: string;
}
