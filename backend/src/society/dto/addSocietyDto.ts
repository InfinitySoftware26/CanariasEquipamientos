import { IsString, IsOptional } from 'class-validator';

export class AddSocietyDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  taxId?: string;

  @IsOptional()
  @IsString()
  address?: string;
}