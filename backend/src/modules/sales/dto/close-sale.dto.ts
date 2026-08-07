import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsOptional } from "class-validator";

export class CloseSaleDto {
  @ApiPropertyOptional({
    example: "2026-08-07",
    description:
      "Fecha real de entrega. Si no se envía, se conserva la existente.",
  })
  @IsOptional()
  @IsDateString()
  deliveryDate?: string;
}