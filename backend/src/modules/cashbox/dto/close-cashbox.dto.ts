import { IsNumber, IsPositive, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CloseCashboxDto {
  @ApiProperty({ example: 85000, description: 'Saldo final declarado al cerrar la caja' })
  @IsNumber()
  @IsPositive()
  closingBalance!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
