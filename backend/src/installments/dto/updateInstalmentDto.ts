import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { InstallmentStatus } from '../enums/installment-status.enum';

export class UpdateInstallmentDto {
  @IsOptional()
  @IsNumber()
  amount?: number; // Monto de la cuota actualizado

  @IsOptional()
  @IsEnum(InstallmentStatus)
  status?: InstallmentStatus; // Estado de la cuota actualizado
}
