import { IsDateString, IsNumber, IsPositive, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateClosureDto {
  @ApiProperty({ example: '2026-07-06', description: 'Fecha del cierre (YYYY-MM-DD)' })
  @IsDateString()
  closingDate!: string;

  @ApiProperty({ example: 85000, description: 'Monto total declarado por el cobrador' })
  @IsNumber()
  @IsPositive()
  totalCollected!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
