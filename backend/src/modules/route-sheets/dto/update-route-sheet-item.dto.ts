import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from "class-validator";

import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

import { RouteSheetItemResult } from "../../../common/enums/route-sheet-item-result.enum";
import { FailedVisitReason } from "../../../common/enums/failed-visit-reason.enum";

export class UpdateRouteSheetItemDto {
  // ============================================================
  // RESULTADO
  // ============================================================

  @ApiProperty({
    enum: RouteSheetItemResult,
    example: RouteSheetItemResult.COMPLETED,
  })
  @IsEnum(RouteSheetItemResult)
  result!: RouteSheetItemResult;

  // ============================================================
  // DINERO COBRADO
  // ============================================================

  @ApiPropertyOptional({
    example: 35000,
    description:
      "Monto cobrado. Requerido para cobros de cuotas y para entregas con primera cuota al momento de entregar.",
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  collectedAmount?: number;

  // ============================================================
  // ENTREGA DEL PRODUCTO
  // ============================================================

  @ApiPropertyOptional({
    example: true,
    description:
      "Indica si el producto fue efectivamente entregado al cliente. Se utiliza en items de tipo DELIVERY.",
  })
  @IsOptional()
  @IsBoolean()
  productDelivered?: boolean;

  // ============================================================
  // RECEPCIÓN DEL DINERO
  // ============================================================

  @ApiPropertyOptional({
    example: true,
    description:
      "Indica si el cobrador recibió efectivamente el dinero correspondiente a la entrega. Se utiliza en items DELIVERY.",
  })
  @IsOptional()
  @IsBoolean()
  paymentReceived?: boolean;

  // ============================================================
  // OBSERVACIONES
  // ============================================================

  @ApiPropertyOptional({
    example: "Entrega realizada correctamente.",
    description: "Observaciones asociadas a la visita.",
  })
  @IsOptional()
  @IsString()
  notes?: string;

  // ============================================================
  // VISITA FALLIDA
  // ============================================================

  @ApiPropertyOptional({
    enum: FailedVisitReason,
    description:
      "Motivo específico cuando una visita de cobranza resulta fallida.",
  })
  @IsOptional()
  @IsEnum(FailedVisitReason)
  failedVisitReason?: FailedVisitReason;
}
