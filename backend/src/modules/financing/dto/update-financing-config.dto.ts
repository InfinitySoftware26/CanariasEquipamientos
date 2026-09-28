import { IsBoolean, IsNumber, IsOptional, IsString, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
export class UpdateFinancingConfigDto {
  @ApiPropertyOptional({ example: 'Financiación Premium' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    example: 0.12,
    description: 'Tasa de financiación base. 0.12 = 12%, 5.0 = 500%',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  financingRate?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
