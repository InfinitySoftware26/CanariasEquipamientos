import { IsDateString, IsEnum, IsNumber, IsOptional } from 'class-validator';
import { InstallmentStatus } from '../enums/installment-status.enum';

export class CreateInstallmentDto {
  @IsNumber()
  societyId: number; // Identificador de la sociedad

  @IsNumber()
  customerId: number; // Identificador del cliente

  @IsNumber()
  amount: number; // Monto de la cuota

  @IsDateString()
  dueDate: string; // Fecha de vencimiento

  @IsOptional()
  @IsEnum(InstallmentStatus)
  status?: InstallmentStatus; // Estado inicial, por defecto PENDING
}
