import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateObservationDto {
  @ApiPropertyOptional({ description: 'Observación de la venta (vacío para borrarla)' })
  @IsOptional()
  @IsString()
  observation?: string;
}
