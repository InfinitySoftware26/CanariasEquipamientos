import { IsUUID, IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FailedVisitReason } from '../../../common/enums/failed-visit-reason.enum';

export class CreateFailedVisitDto {
  @ApiProperty({ description: 'UUID del ítem de hoja de ruta visitado' })
  @IsUUID()
  routeSheetItemId!: string;

  @ApiProperty({ description: 'UUID del cliente visitado' })
  @IsUUID()
  clientId!: string;

  @ApiPropertyOptional({ description: 'UUID de la cuota que se intentaba cobrar' })
  @IsOptional()
  @IsUUID()
  installmentId?: string;

  @ApiProperty({ enum: FailedVisitReason, example: FailedVisitReason.CLIENT_ABSENT })
  @IsEnum(FailedVisitReason)
  reason!: FailedVisitReason;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
