import { ApiProperty } from "@nestjs/swagger";
import { IsDateString } from "class-validator";

export class UpdateInstallmentDateDto {
  @ApiProperty({
    example: "2026-10-15",
    description: "Nueva fecha de vencimiento de la cuota",
  })
  @IsDateString()
  dueDate!: string;
}
