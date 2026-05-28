import { IsString, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({ description: 'Contrasena actual' })
  @IsString()
  currentPassword!: string;

  @ApiProperty({ description: 'Nueva contrasena', minLength: 8 })
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/, {
    message: 'La contrasena debe tener al menos una mayuscula, una minuscula y un numero',
  })
  newPassword!: string;
}
