import { IsUUID, IsNumber, IsPositive, IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod } from '../../../common/enums/payment-method.enum';

export class CreateSupplierPaymentDto {
  @ApiProperty({ description: 'UUID del proveedor' })
  @IsUUID()
  supplierId!: string;

  @ApiProperty({ example: 50000 })
  @IsNumber()
  @IsPositive()
  amount!: number;

  @ApiProperty({ enum: PaymentMethod, example: PaymentMethod.TRANSFER })
  @IsEnum(PaymentMethod)
  method!: PaymentMethod;

  @ApiPropertyOptional({ description: 'UUID de la factura a imputar automáticamente el monto total pagado' })
  @IsOptional()
  @IsUUID()
  supplierInvoiceId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
