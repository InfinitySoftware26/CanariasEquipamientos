import { IsEnum, IsNumber, IsOptional } from 'class-validator';

export enum PaymentMethod {
  CASH = 'CASH',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CARD = 'CARD',
}

export class CreatePaymentDto {
  @IsNumber()
  amount: number; 
  // Monto pagado por el cliente

  @IsEnum(PaymentMethod)
  method: PaymentMethod; 
  // Método de pago: efectivo, transferencia bancaria o tarjeta

  @IsOptional()
  @IsNumber()
  installmentId?: number; 
  // Cuota asociada (se puede setear desde la lógica, no lo ingresa el cliente directamente)

  @IsOptional()
  reference?: string; 
  // Referencia opcional (ej. número de comprobante, ticket, etc.)
}
