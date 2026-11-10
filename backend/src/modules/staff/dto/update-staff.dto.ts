import {
  IsString,
  IsOptional,
  IsEmail,
  IsEnum,
  IsBoolean,
  MaxLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { AssignableRole } from '../../../common/enums/assignable-role.enum';

export class UpdateStaffDto {
  @ApiPropertyOptional({ example: 'Juan Perez' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ example: 'juan@canarias.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '2994123456' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional({ example: 'Av. Siempre Viva 742' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  address?: string;

  /**
   * Solo roles asignables: SUPER_ADMIN se crea únicamente por
   * POST /staff/super-admin y no se puede asignar por edición.
   */
  @ApiPropertyOptional({ enum: AssignableRole })
  @IsOptional()
  @IsEnum(AssignableRole)
  role?: AssignableRole;

  @ApiPropertyOptional({ description: 'Activar o desactivar el empleado' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
