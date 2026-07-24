import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsUUID,
  IsOptional,
  MinLength,
  MaxLength,
  Matches,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

/**
 * DTO exclusivo para crear SUPER_ADMIN.
 * No expone el campo role — siempre es SUPER_ADMIN.
 * societyId es opcional: el superadmin puede no tener sociedad asignada.
 */
export class CreateSuperAdminDto {
  @ApiProperty({ example: "Carlos Dueno" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @ApiProperty({
    example: "25987654",
    description: "DNI sin puntos, 7 u 8 digitos",
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9]{7,8}$/, {
    message: "DNI debe tener 7 u 8 digitos numericos",
  })
  dni!: string;

  @ApiProperty({
    example: "2994123456",
    description: "Teléfono del empleado",
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiProperty({ example: "carlos@canarias.com" })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: "Password123!", minLength: 8 })
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/, {
    message:
      "La contrasena debe tener al menos una mayuscula, una minuscula y un numero",
  })
  password!: string;

  @ApiPropertyOptional({
    description: "UUID de sociedad (opcional para superadmin)",
  })
  @IsOptional()
  @IsUUID()
  societyId?: string;
}
