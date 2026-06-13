import { IsNumber, IsOptional, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateFinancingConfigDto {
  @ApiPropertyOptional({ example: 0.15, description: 'Tasa para 3 cuotas (0.15 = 15%)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  installments3Rate?: number;

  @ApiPropertyOptional({ example: 0.25 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  installments6Rate?: number;

  @ApiPropertyOptional({ example: 0.35 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  installments9Rate?: number;
}
