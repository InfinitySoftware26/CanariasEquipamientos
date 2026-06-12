import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateZoneDto {
  @ApiProperty({ example: 'Zona Norte' })
  @IsString() @IsNotEmpty() @MaxLength(100)
  name!: string;

  @ApiPropertyOptional({ example: 'Zona norte de la ciudad' })
  @IsOptional() @IsString() @MaxLength(255)
  description?: string;
}
