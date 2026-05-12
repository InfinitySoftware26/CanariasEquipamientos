import {
  IsString,
  IsEmail,
  MinLength,
  MaxLength,
  IsNumber,
  IsDate,
  IsEnum,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { ClientStatus } from '../enums/client-status.enum';

export class CreateClientDto {
  @IsNumber()
  dni: number;

  @IsString()
  @IsOptional()
  imgDniForehead?: string;

  @IsString()
  @IsOptional()
  imgDniBack?: string;

  @IsString()
  @IsOptional()
  imgService?: string;

  @IsString()
  @MinLength(3)
  @MaxLength(255)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  phone: string;

  @IsString()
  address: string;

  @IsDate()
  birthday: Date;

  @IsUUID()
  zoneId: string;

  // COBRADOR RESPONSABLE (FK a STAFF)
  @IsUUID()
  staffId: string;

  @IsUUID()
  societyId: string;

  @IsEnum(ClientStatus)
  @IsOptional()
  status?: ClientStatus;
}
