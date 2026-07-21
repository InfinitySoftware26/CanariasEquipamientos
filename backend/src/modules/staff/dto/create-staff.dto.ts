import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsEnum,
  IsUUID,
  MinLength,
  MaxLength,
  Matches,
  IsOptional,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { AssignableRole } from "../../../common/enums/assignable-role.enum";

export class CreateStaffDto {
  @ApiProperty({ example: "Juan Perez" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @ApiProperty({
    example: "30123456",
    description: "DNI sin puntos, 7 u 8 dígitos",
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9]{7,8}$/, {
    message: "DNI debe tener 7 u 8 digitos numericos",
  })
  dni!: string;

  @ApiProperty({ example: "juan@canarias.com" })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: "2994123456",
    description: "Teléfono del empleado",
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiProperty({
    example: "Password123!",
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/, {
    message:
      "La contrasena debe tener al menos una mayuscula, una minuscula y un numero",
  })
  password!: string;

  @ApiProperty({
    enum: AssignableRole,
    description:
      "Rol del empleado. Para crear SUPER_ADMIN usar POST /staff/super-admin",
  })
  @IsEnum(AssignableRole)
  role!: AssignableRole;

  @ApiProperty({
    description: "UUID de la sociedad principal del empleado",
  })
  @IsUUID()
  societyId!: string;
}