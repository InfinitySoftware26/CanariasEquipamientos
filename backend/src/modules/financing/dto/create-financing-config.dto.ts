import { IsArray, IsBoolean, IsNumber, IsOptional, IsString, IsUUID, Max, Min, ArrayUnique } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

/**
 * DTO para crear una nueva configuración de financiación.
 *
 * Ejemplo:
 *   POST /financing-config
 *   {
 *     "name": "Financiación Estándar",
 *     "financingRate": 0.12,
 *     "isGlobal": true
 *   }
 */
export class CreateFinancingConfigDto {
  @ApiProperty({ example: "Financiación Estándar" })
  @IsString()
  name!: string;

  @ApiProperty({
    example: 0.12,
    description: "Tasa de financiación base. 0.12 = 12%",
  })
  @IsNumber()
  @Min(0)
  @Max(1)
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
