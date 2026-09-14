import { ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  Max,
  Min,
} from "class-validator";

import { CollectionScheduleType } from "../../../common/enums/collection-schedule-type.enum";

export class ConfigureCollectionScheduleDto {
  @ApiPropertyOptional({
    enum: CollectionScheduleType,
  })
  @IsOptional()
  @IsEnum(CollectionScheduleType)
  collectionScheduleType?: CollectionScheduleType;

  @ApiPropertyOptional({
    description: "Día de semana JS: 0=domingo ... 6=sábado",
    minimum: 0,
    maximum: 6,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(6)
  collectionWeekday?: number;

  @ApiPropertyOptional({
    minimum: 1,
    maximum: 31,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(31)
  paymentRangeStartDay?: number;

  @ApiPropertyOptional({
    minimum: 1,
    maximum: 31,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(31)
  paymentRangeEndDay?: number;

  @ApiPropertyOptional({
    description:
      "Día puntual coordinado con el cliente dentro del rango mensual",
  })
  @IsOptional()
  @IsDateString()
  manualCollectionDate?: string;

  @ApiPropertyOptional({
    default: true,
    description: "La primera cuota vence el día de entrega",
  })
  @IsOptional()
  @IsBoolean()
  firstInstallmentOnDelivery?: boolean;

  @ApiPropertyOptional({
    description:
      "Fecha manual de la primera cuota cuando no coincide con la entrega",
  })
  @IsOptional()
  @IsDateString()
  firstDueDate?: string;

  @ApiPropertyOptional({
    description:
      "Fecha manual de la segunda cuota; desde aquí continúa la frecuencia",
  })
  @IsOptional()
  @IsDateString()
  secondDueDate?: string;

  @ApiPropertyOptional({
    example: 0.002,
    description: "Interés diario por mora en fracción. 0.002 = 0,2% diario",
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  dailyLateInterestRate?: number;
}
