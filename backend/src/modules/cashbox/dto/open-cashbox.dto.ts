import { IsNumber, IsPositive, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class OpenCashboxDto {
  @ApiProperty({ example: 20000, description: 'Saldo inicial con el que se abre la caja' })
  @IsNumber()
  @IsPositive()
  openingBalance!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
