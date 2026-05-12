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

export class CreatePaymentSupplierDto {
  @IsNumber()
  supplierId: number; // Identificador del proveedor

  @IsDateString()
  paymentDate: string; // Fecha del pago

  @IsNumber()
  totalAmount: number; // Monto total del pago

  @IsEnum(Currency)
  currency: Currency; // Moneda del pago

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod; // Método de pago

  @IsOptional()
  @IsString()
  bankReference?: string; // Referencia bancaria opcional

  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus; // Estado del pago, por defecto PENDING

  @IsNumber()
  responsibleStaffId: number; // Personal responsable del pago

  @IsOptional()
  @IsString()
  notes?: string; // Observaciones opcionales

  @IsOptional()
  @IsString()
  voucherAttachment?: string; // Ruta del comprobante adjunto opcional
}
