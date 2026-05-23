import { IsUUID, IsEnum, IsNumber, IsPositive, IsDateString, IsOptional, IsString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod } from '../../../common/enums/payment-method.enum';

export class SaleProductDto {
  @ApiProperty() @IsUUID()                 productId!: string;
  @ApiProperty() @IsNumber() @IsPositive() quantity!: number;
  @ApiProperty() @IsNumber() @IsPositive() unitPrice!: number;
}

export class CreateSaleDto {
  @ApiProperty() @IsUUID()
  clientId!: string;

  @ApiProperty({ enum: PaymentMethod }) @IsEnum(PaymentMethod)
  paymentType!: PaymentMethod;

  @ApiProperty() @IsNumber() @IsPositive()
  totalAmount!: number;

  @ApiProperty() @IsDateString()
  saleDate!: string;

  @ApiPropertyOptional() @IsOptional() @IsString()
  observation?: string;

  @ApiProperty({ type: [SaleProductDto] })
  @IsArray() @ValidateNested({ each: true }) @Type(() => SaleProductDto)
  products!: SaleProductDto[];
}
