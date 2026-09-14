import { ApiProperty } from "@nestjs/swagger";

import { IsNumber, Max, Min } from "class-validator";

export class UpdateLateInterestDto {
  @ApiProperty({
    example: 0.002,
    description:
      "Interés diario expresado como fracción. 0.002 equivale a 0,2% diario.",
  })
  @IsNumber()
  @Min(0)
  @Max(1)
  dailyLateInterestRate!: number;
}
