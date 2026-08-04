import { IsUUID, IsEnum, IsNumber, IsPositive, IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CashMovementType } from '../../../common/enums/cash-movement-type.enum';

export class CreateCashMovementDto {
  @ApiProperty({ description: 'UUID de la caja' })
  @IsUUID()
  cashboxId!: string;

  @ApiProperty({ enum: CashMovementType, example: CashMovementType.EXPENSE })
  @IsEnum(CashMovementType)
  type!: CashMovementType;

  @ApiProperty({ example: 5000 })
  @IsNumber()
  @IsPositive()
  amount!: number;

  @ApiProperty({ example: 'Compra de insumos de oficina' })
  @IsString()
  @IsNotEmpty()
  concept!: string;

  @ApiPropertyOptional({ description: 'UUID de pago de cliente asociado (si el movimiento proviene de una cobranza)' })
  @IsOptional()
  @IsUUID()
  relatedPaymentId?: string;

  @ApiPropertyOptional({ description: 'UUID de pago a proveedor asociado' })
  @IsOptional()
  @IsUUID()
  relatedSupplierPaymentId?: string;
}
