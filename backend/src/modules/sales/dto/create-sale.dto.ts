import {
  IsUUID, IsNumber, IsOptional,
  IsString, IsArray, ValidateNested, IsEnum, Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentFrequency } from '../../../common/enums/payment-frequency.enum';
import { SaleProductDto } from './sale-product.dto';

export class CreateSaleDto {
  @ApiProperty({ description: 'UUID del cliente' })
  @IsUUID()
  clientId!: string;

  @ApiPropertyOptional({ description: 'UUID del plan de financiación seleccionado' })
  @IsOptional()
  @IsUUID()
  financingPlanId?: string;

  @ApiPropertyOptional({ description: 'UUID de la promoción seleccionada' })
  @IsOptional()
  @IsUUID()
  promotionId?: string;

  @ApiPropertyOptional({ description: 'UUID de la configuración de financiación (modo personalizado)' })
  @IsOptional()
  @IsUUID()
  financingConfigId?: string;

  @ApiPropertyOptional({ description: 'Tasa de financiación directa (modo personalizado, ej: 0.25 = 25%)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  financingRate?: number;

  @ApiProperty({ example: 3, description: 'Cantidad de cuotas' })
  @IsNumber()
  @Min(1)
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
