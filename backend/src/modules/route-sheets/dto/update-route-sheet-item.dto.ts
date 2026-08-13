import {
  IsEnum,
  IsOptional,
  IsNumber,
  IsPositive,
  IsString,
} from "class-validator";

import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

import { RouteSheetItemResult } from "../../../common/enums/route-sheet-item-result.enum";
import { FailedVisitReason } from "../../../common/enums/failed-visit-reason.enum";

export class UpdateRouteSheetItemDto {
  @ApiProperty({
    enum: RouteSheetItemResult,
    example: RouteSheetItemResult.COMPLETED,
  })
  @IsEnum(RouteSheetItemResult)
  result!: RouteSheetItemResult;

  @ApiPropertyOptional({
    example: 15000,
    description:
      "Monto cobrado. Requerido si item_type=installment y result=completed",
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  collectedAmount?: number;

  @ApiPropertyOptional({
    description: "Observaciones de la visita",
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    enum: FailedVisitReason,
    description: "Motivo específico cuando la visita resulta fallida",
  })
  @IsOptional()
  @IsEnum(FailedVisitReason)
  failedVisitReason?: FailedVisitReason;
}
