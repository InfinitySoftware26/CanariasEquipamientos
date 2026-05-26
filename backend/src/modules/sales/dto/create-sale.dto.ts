import {
  IsUUID, IsEnum, IsNumber, IsPositive,
  IsDateString, IsOptional, IsString,
  IsArray, ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod } from '../../../common/enums/payment-method.enum';
import { SaleProductDto } from './sale-product.dto';

export class CreateSaleDto {
  @ApiProperty({ description: 'UUID del cliente' })
  @IsUUID()
  clientId!: string;

  @ApiProperty({ enum: PaymentMethod, description: 'Método de pago' })
  @IsEnum(PaymentMethod)
  paymentType!: PaymentMethod;

  @ApiProperty({ example: 120000, description: 'Monto total de la venta' })
  @IsNumber()
  @IsPositive()
  totalAmount!: number;

  @ApiProperty({ example: '2026-05-22T10:00:00Z' })
  @IsDateString()
  saleDate!: string;

  @ApiPropertyOptional({ description: 'Observaciones opcionales' })
  @IsOptional()
  @IsString()
  observation?: string;

  @ApiProperty({ type: [SaleProductDto], description: 'Productos incluidos en la venta' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaleProductDto)
  products!: SaleProductDto[];
}
