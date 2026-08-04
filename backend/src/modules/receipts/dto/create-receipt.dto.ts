import { IsUUID, IsOptional, IsNumber, IsPositive } from 'class-validator';
import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';

export class CreateReceiptDto {
  @ApiPropertyOptional({ description: 'UUID del pago de cliente a recibar (excluyente con supplierPaymentId)' })
  @IsOptional()
  @IsUUID()
  paymentId?: string;

  @ApiPropertyOptional({ description: 'UUID del pago a proveedor a recibar (excluyente con paymentId)' })
  @IsOptional()
  @IsUUID()
  supplierPaymentId?: string;

  @ApiProperty({ example: 15000 })
  @IsNumber()
  @IsPositive()
  amount!: number;
}
