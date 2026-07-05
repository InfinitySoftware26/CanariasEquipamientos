import { IsNumber, IsOptional, IsInt, IsBoolean, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpsertProductFinancingConfigDto {
  @ApiPropertyOptional({ example: 0.1, description: 'Tasa para 3 cuotas (0.10 = 10%)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  installments3Rate?: number;

  @ApiPropertyOptional({ example: 0.2 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  installments6Rate?: number;

  @ApiPropertyOptional({ example: 0.3 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  installments9Rate?: number;

  @ApiPropertyOptional({ example: 6, description: 'Cantidad máxima de cuotas permitida para este producto' })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxInstallments?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
