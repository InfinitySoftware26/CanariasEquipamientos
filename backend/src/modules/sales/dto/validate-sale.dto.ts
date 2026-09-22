import {
  IsBoolean,
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

  @ApiPropertyOptional({
    example: true,
    description:
      "Indica si el cobrador recibió la fotocopia del DNI durante la visita ambiental.",
  })
  @IsOptional()
  @IsBoolean()
  dniCopyReceived?: boolean;

  @ApiPropertyOptional({
    example: true,
    description:
      "Indica si el cobrador recibió el/los recibos de sueldo durante la visita ambiental.",
  })
  @IsOptional()
  @IsBoolean()
  salaryReceiptReceived?: boolean;

  @ApiPropertyOptional({
    example: false,
    description: "Indica si el cobrador recibió otra documentación adicional.",
  })
  @IsOptional()
  @IsBoolean()
  otherDocumentsReceived?: boolean;
}
