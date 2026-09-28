import { IsDateString } from "class-validator";

import { ApiProperty } from "@nestjs/swagger";

export class GenerateRouteSheetsDto {
  @ApiProperty({
    example: "2026-09-15",
    description: "Fecha para la cual se generan las hojas programadas",
  })
  @IsDateString()
  routeDate!: string;
}
