import { IsBoolean, IsNumber, IsOptional, IsString, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO para actualizar una configuración de financiación existente.
 *
 * Campos opcionales — solo los que se deseen modificar:
 *   - name: nombre de la configuración
 *   - financingRate: tasa de financiación
 *   - isActive: activa o inactiva
 */
export class UpdateFinancingConfigDto {
  @ApiPropertyOptional({ example: 'Financiación Premium' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    example: 0.12,
    description: 'Tasa de financiación base. 0.12 = 12%',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  financingRate?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
