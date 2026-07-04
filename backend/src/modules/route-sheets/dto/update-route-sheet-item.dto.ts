import { IsEnum, IsOptional, IsNumber, IsPositive, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RouteSheetItemResult } from '../../../common/enums/route-sheet-item-result.enum';

export class UpdateRouteSheetItemDto {
  @ApiProperty({ enum: RouteSheetItemResult, example: RouteSheetItemResult.COMPLETED })
  @IsEnum(RouteSheetItemResult)
  result!: RouteSheetItemResult;

  @ApiPropertyOptional({ example: 15000, description: 'Monto cobrado (requerido si item_type=installment y result=completed)' })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  collectedAmount?: number;

  @ApiPropertyOptional({ description: 'Observaciones de la visita / motivo de fallo' })
  @IsOptional()
  @IsString()
  notes?: string;
}
