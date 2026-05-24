import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'admin@canarias.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'miPassword123' })
  @IsString()
  @MinLength(6)
  password!: string;
}
