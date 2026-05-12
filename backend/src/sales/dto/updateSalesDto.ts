import {
  IsOptional,
  IsUUID,
  IsString,
  IsNumber,
  IsDateString,
} from 'class-validator';

export class UpdateSaleDto {
  @IsUUID()
  @IsOptional()
  clientId?: string;

  @IsUUID()
  @IsOptional()
  sellerId?: string;

  @IsUUID()
  @IsOptional()
  collectorId?: string;

  @IsString()
  @IsOptional()
  product?: string;

  @IsNumber()
  @IsOptional()
  installments?: number;

  @IsNumber()
  @IsOptional()
  totalPrice?: number;

  @IsDateString()
  @IsOptional()
  date?: string;

  @IsString()
  @IsOptional()
  status?: string;
}
