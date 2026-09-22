import { ApiProperty } from "@nestjs/swagger";

import { IsNumber, Max, Min } from "class-validator";

export class UpdateSocietyLateInterestDto {
  @ApiProperty({
    example: 0.002,
    description:
      "Tasa diaria de mora por defecto de la sucursal. 0.002 equivale a 0,2% diario.",
    minimum: 0,
    maximum: 1,
  })
  @IsNumber()
  @Min(0)
  @Max(1)
  defaultDailyLateInterestRate!: number;
}
