import { IsArray, IsBoolean, IsNumber, IsOptional, IsString, IsUUID, Max, Min, ArrayUnique } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
export class CreateFinancingConfigDto {
  @ApiProperty({ example: "Financiación Estándar" })
  @IsString()
  name!: string;

  @ApiProperty({
    example: 0.12,
    description: "Tasa de financiación base. 0.12 = 12%, 5.0 = 500%",
  })
  @IsNumber()
  @Min(0)
  financingRate!: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isGlobal?: boolean;

  @ApiPropertyOptional({
    type: [String],
    description: "Productos específicos. Requerido solo si isGlobal = false.",
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsUUID("4", { each: true })
  productIds?: string[];
}
