import {
  IsString,
  IsEmail,
  IsDate,
  IsOptional,
  IsNumber,
  IsEnum,
  IsUUID,
} from 'class-validator';
import { ClientStatus } from '../enums/client-status.enum';

export class UpdateClientDto {
  @IsNumber()
  @IsOptional()
  dni?: number;

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
  @IsOptional()
  name?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsDate()
  @IsOptional()
  birthday?: Date;

  @IsUUID()
  @IsOptional()
  zoneId?: string;

  @IsUUID()
  @IsOptional()
  staffId?: string;

  @IsUUID()
  @IsOptional()
  societyId?: string;

  @IsEnum(ClientStatus)
  @IsOptional()
  status?: ClientStatus;
}
