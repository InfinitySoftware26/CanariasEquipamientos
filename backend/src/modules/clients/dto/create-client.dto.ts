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
  @ApiPropertyOptional({ description: "Nombre del cliente" })
  @IsOptional()
  @IsString()
  name?: string;
  
  @ApiPropertyOptional({ description: "Apellido del cliente" })
  @IsOptional()
  @IsString()
  surname?: string;

  @ApiPropertyOptional({ description: "Número de documento del cliente" })
  @IsOptional()
  @IsString()
  documentNumber?: string;

  @ApiPropertyOptional({ description: "Dirección del cliente" })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ description: "Teléfono del cliente" })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: "Correo electrónico del cliente" })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: "ID de la zona del cliente" })
  @IsOptional()
  @IsUUID()
  zoneId?: string;

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

  @ApiPropertyOptional({ description: "Profesión del cliente" })
  @IsOptional()
  @IsString()
  profession?: string;

  @ApiPropertyOptional({ description: "Ingreso mensual del cliente" })
  @IsOptional()
  @IsString()
  monthlyIncome?: string;

  @ApiPropertyOptional({ description: "Método de cobro del cliente" })
  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @ApiPropertyOptional({ description: "Dependientes a cargo del cliente" })
  @IsOptional()
  @IsString()
  incomeDependents?: string;

  @ApiPropertyOptional({ description: "Ingreso adicional del cliente" })
  @IsOptional()
  @IsString()
  additionalIncome?: string;

  @ApiPropertyOptional({ description: "Situación de vivienda del cliente" })
  @IsOptional()
  @IsString()
  housingSituation?: string;

  @ApiPropertyOptional({ description: "Duración del contrato de alquiler" })
  @IsOptional()
  @IsString()
  contractDuration?: string;

  @ApiPropertyOptional({ description: "CUIL del cliente" })
  @IsOptional()
  @IsString()
  cuil?: string;

  @ApiPropertyOptional({
    description: "Indica si el cliente tiene otro crédito activo",
  })
  @IsOptional()
  @IsBoolean()
  activeCredit?: boolean;

  @ApiPropertyOptional() @IsOptional() @IsString() observations?: string;

  @ApiPropertyOptional() @IsOptional() @IsUUID() societyId?: string;
}
