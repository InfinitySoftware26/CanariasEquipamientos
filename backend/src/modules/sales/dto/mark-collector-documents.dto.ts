import { IsBoolean, IsOptional, IsString, MaxLength } from "class-validator";

import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class MarkCollectorDocumentsDto {
  @ApiProperty({
    example: true,
    description: "Indica si la documentación fue entregada al cobrador.",
  })
  @IsBoolean()
  delivered!: boolean;

  @ApiPropertyOptional({
    example: "Documentación entregada al cobrador asignado.",
    description: "Observación opcional asociada a la entrega de documentación.",
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
