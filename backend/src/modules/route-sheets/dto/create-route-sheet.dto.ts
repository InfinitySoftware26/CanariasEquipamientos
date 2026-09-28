import {
  IsDateString,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from "class-validator";

import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateRouteSheetDto {
  @ApiProperty({
    description: "UUID de la zona",
  })
  @IsUUID()
  zoneId!: string;

  @ApiProperty({
    description: "UUID del cobrador asignado",
  })
  @IsUUID()
  staffId!: string;

  @ApiProperty({
    example: "2026-09-15",
    description: "Fecha extraordinaria del recorrido",
  })
  @IsDateString()
  routeDate!: string;

  @ApiPropertyOptional({
    description: "Motivo u observaciones de la hoja extraordinaria",
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
