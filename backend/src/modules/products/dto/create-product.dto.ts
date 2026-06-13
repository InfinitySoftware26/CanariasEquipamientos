import { IsString, IsNumber, IsPositive, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ example: 'Heladera No Frost' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'Samsung' })
  @IsString()
  @IsNotEmpty()
  brand!: string;

  @ApiProperty({ example: 'RT32K5730S8' })
  @IsString()
  @IsNotEmpty()
  model!: string;

  @ApiPropertyOptional({ example: 'Electrodomésticos' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 450000 })
  @IsNumber()
  @IsPositive()
  price!: number;

  @ApiPropertyOptional({ example: 320000 })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  costPrice?: number;
}
