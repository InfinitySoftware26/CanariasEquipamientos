import {
  IsString, IsNotEmpty, IsOptional,
  IsEmail, MaxLength, Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSocietyDto {
  @ApiProperty({ example: 'Canarias Norte' })
  @IsString() @IsNotEmpty() @MaxLength(100)
  name!: string;

  @ApiProperty({ example: 'Canarias Equipamientos S.R.L.' })
  @IsString() @IsNotEmpty() @MaxLength(150)
  businessName!: string;

  @ApiProperty({ example: '30-12345678-9', description: 'Formato XX-XXXXXXXX-X' })
  @IsString() @IsNotEmpty()
  @Matches(/^[0-9]{2}-[0-9]{8}-[0-9]$/, { message: 'CUIT debe tener formato XX-XXXXXXXX-X' })
  taxId!: string;

  @ApiPropertyOptional({ example: 'Av. Siempre Viva 742' })
  @IsOptional() @IsString() @MaxLength(200)
  address?: string;

  @ApiPropertyOptional({ example: '2994123456' })
  @IsOptional() @IsString() @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional({ example: 'contacto@canarias.com' })
  @IsOptional() @IsEmail()
  email?: string;
}
