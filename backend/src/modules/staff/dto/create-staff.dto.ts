import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsEnum,
  IsUUID,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { StaffRole } from '../../../common/enums/staff-role.enum';

export class CreateStaffDto {
  @ApiProperty({ example: 'Juan Perez' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @ApiProperty({ example: '30123456', description: 'DNI sin puntos, 7 u 8 digitos' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9]{7,8}$/, { message: 'DNI debe tener 7 u 8 digitos numericos' })
  dni!: string;

  @ApiProperty({ example: 'juan@canarias.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'Password123!', minLength: 8 })
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/, {
    message: 'La contrasena debe tener al menos una mayuscula, una minuscula y un numero',
  })
  password!: string;

  @ApiProperty({ enum: StaffRole, description: 'Rol del empleado' })
  @IsEnum(StaffRole)
  role!: StaffRole;

  @ApiProperty({ description: 'UUID de la sociedad principal del empleado' })
  @IsUUID()
  societyId!: string;
}
