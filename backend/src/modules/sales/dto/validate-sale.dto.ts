import {
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";

import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class ValidateSaleDto {
  @ApiProperty({
    example: "approved",
    enum: ["approved", "rejected"],
  })
  @IsIn(["approved", "rejected"])
  status!: "approved" | "rejected";

  @ApiPropertyOptional({
    description:
      "Observaciones de la visita ambiental. Obligatorio si la visita es rechazada.",
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  observations?: string;
}
