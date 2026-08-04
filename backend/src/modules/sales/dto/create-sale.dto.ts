import {
  IsUUID, IsNumber, IsOptional,
  IsString, IsArray, ValidateNested, IsIn, IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentFrequency } from '../../../common/enums/payment-frequency.enum';
import { SaleProductDto } from './sale-product.dto';

export class CreateSaleDto {
  @ApiProperty({ description: 'UUID del cliente' })
  @IsUUID()
  clientId!: string;

  @ApiProperty({ example: 3, description: 'Cantidad de cuotas: 3, 6 o 9' })
  @IsNumber()
  @IsIn([3, 6, 9])
  installmentsCount!: number;

  @ApiProperty({ enum: PaymentFrequency, example: PaymentFrequency.MONTHLY })
  @IsEnum(PaymentFrequency)
  paymentFrequency!: PaymentFrequency;

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
