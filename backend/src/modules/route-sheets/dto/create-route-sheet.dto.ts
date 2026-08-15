import { IsUUID, IsDateString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateRouteSheetDto {
  @ApiProperty({ description: "UUID de la zona" })
  @IsUUID()
  zoneId!: string;

  @ApiProperty({ description: "UUID del cobrador asignado" })
  @IsUUID()
  staffId!: string;

  @ApiProperty({
    example: "2026-07-06",
    description: "Fecha del recorrido (YYYY-MM-DD)",
  })
  @IsDateString()
  routeDate!: string;
}
