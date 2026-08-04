import { IsUUID, IsNumber, IsPositive, IsArray, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class InstallmentApplicationDto {
  @ApiProperty({ description: 'UUID de la cuota a imputar' })
  @IsUUID()
  installmentId!: string;

  @ApiProperty({ example: 10000, description: 'Monto a imputar a esta cuota' })
  @IsNumber()
  @IsPositive()
  amount!: number;
}

export class ApplyPaymentDto {
  @ApiProperty({ type: [InstallmentApplicationDto], description: 'Imputación manual del pago a una o más cuotas' })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => InstallmentApplicationDto)
  applications!: InstallmentApplicationDto[];
}
