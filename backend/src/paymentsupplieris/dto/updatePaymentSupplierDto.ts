import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { PaymentStatus } from '../enums/payment-status.enum';
import { Currency } from '../enums/currency.enum';
import { PaymentMethod } from '../enums/payment-method.enum';

export class UpdatePaymentSupplierDto {
  @IsOptional()
  @IsDateString()
  paymentDate?: string; // Fecha del pago actualizada

  @IsOptional()
  @IsNumber()
  totalAmount?: number; // Monto total actualizado

  @IsOptional()
  @IsEnum(Currency)
  currency?: Currency; // Moneda actualizada

  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod; // Método de pago actualizado

  @IsOptional()
  @IsString()
  bankReference?: string; // Referencia bancaria actualizada

  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus; // Estado del pago actualizado

  @IsOptional()
  @IsNumber()
  responsibleStaffId?: number; // Personal responsable actualizado

  @IsOptional()
  @IsString()
  notes?: string; // Observaciones actualizadas

  @IsOptional()
  @IsString()
  voucherAttachment?: string; // Comprobante adjunto actualizado
}
