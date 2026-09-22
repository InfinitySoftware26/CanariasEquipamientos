import { ApiPropertyOptional } from "@nestjs/swagger";

import { IsNumber, IsOptional, Max, Min } from "class-validator";

export class UpdateLateInterestDto {
  @ApiPropertyOptional({
    example: 0.002,
    description:
      "Interés diario expresado como fracción. 0.002 equivale a 0,2% diario.",
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  dailyLateInterestRate?: number;

  @ApiPropertyOptional({
    example: 3500,
    description:
      "Monto de mora pendiente definido manualmente. Permite ajustar o condonar la mora de una cuota.",
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  lateInterestAmount?: number;
}
