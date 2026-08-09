import {
  IsString,
  IsOptional,
  IsEmail,
  Matches,
  IsBoolean,
  IsUUID,
  IsDateString,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateClientDto {
  @ApiPropertyOptional() @IsOptional() @IsString() name?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() surname?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() documentNumber?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() address?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() phone?: string;
  @ApiPropertyOptional() @IsOptional() @IsEmail() email?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() zoneId?: string;

  @ApiProperty({ description: "Nombre de la referencia 1 para garantía" })
  @IsString()
  nameReference1!: string;

  @ApiProperty({ description: "Teléfono de la referencia 1 para garantía" })
  @IsString()
  telReference1!: string;

  @ApiProperty({ description: "Dirección de la referencia 1 para garantía" })
  @IsString()
  addressReference1!: string;

  @ApiProperty({ description: "Nombre de la referencia 2 para garantía" })
  @IsString()
  nameReference2!: string;

  @ApiProperty({ description: "Teléfono de la referencia 2 para garantía" })
  @IsString()
  telReference2!: string;

  @ApiProperty({ description: "Dirección de la referencia 2 para garantía" })
  @IsString()
  addressReference2!: string;

  @ApiPropertyOptional() @IsOptional() @IsBoolean() supportDni?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() supportBill?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() supportVisit?: boolean;

  @ApiPropertyOptional() @IsOptional() @IsString() visitName?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() visitDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() observations?: string;

  @ApiPropertyOptional() @IsOptional() @IsUUID() societyId?: string;
}
