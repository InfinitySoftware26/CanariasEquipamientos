import { IsString, IsEmail, IsDate, IsNumber } from 'class-validator';

export class CreateStaffDto {
  @IsString()
  name: string;

  @IsString()
  lastName: string;

  @IsNumber()
  dni: number;

  @IsEmail()
  email: string;

  @IsString()
  role: string;

  @IsString()
  adress: string;

  @IsDate()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;
}
