import { IsUUID, IsNumber, IsPositive, IsArray, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class SupplierInvoiceApplicationDto {
  @ApiProperty({ description: 'UUID de la factura de proveedor a imputar' })
  @IsUUID()
  supplierInvoiceId!: string;

  @ApiProperty({ example: 30000, description: 'Monto a imputar a esta factura' })
  @IsNumber()
  @IsPositive()
  amount!: number;
}

export class ApplySupplierPaymentDto {
  @ApiProperty({ type: [SupplierInvoiceApplicationDto], description: 'Imputación manual del pago a una o más facturas' })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => SupplierInvoiceApplicationDto)
  applications!: SupplierInvoiceApplicationDto[];
}
