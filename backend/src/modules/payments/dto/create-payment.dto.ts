import { IsUUID, IsNumber, IsPositive, IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod } from '../../../common/enums/payment-method.enum';

export class CreatePaymentDto {
  @ApiProperty({ description: 'UUID de la venta asociada' })
  @IsUUID()
  saleId!: string;

  @ApiProperty({ description: 'UUID del cliente' })
  @IsUUID()
  clientId!: string;

  @ApiProperty({ example: 15000, description: 'Monto cobrado' })
  @IsNumber()
  @IsPositive()
  amount!: number;

  @ApiProperty({ enum: PaymentMethod, example: PaymentMethod.CASH })
  @IsEnum(PaymentMethod)
  method!: PaymentMethod;

  @ApiPropertyOptional({ description: 'Cuota a imputar automáticamente por el monto total del pago' })
  @IsOptional()
  @IsUUID()
  installmentId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
