import { Type } from 'class-transformer';
import {
  IsOptional,
  IsDateString,
  IsNumber,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateSaleDto {
  @IsUUID()
  clientId: string;

  @IsUUID()
  sellerId: string; // FK hacia Staff

  @IsUUID()
  collectorId: string; // FK hacia Staff

  @IsString()
  product: string; // producto vendido

  @IsNumber()
  installments: number; // número de cuotas

  @IsNumber()
  totalPrice: number; // precio total de la venta

  @IsDateString()
  date: string; // momento de la venta

  @IsOptional()
  status?: string;
}
