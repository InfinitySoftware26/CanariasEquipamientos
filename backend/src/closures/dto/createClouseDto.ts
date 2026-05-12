import { IsDateString, IsEnum, IsNumber, IsOptional } from 'class-validator';
import { ClosureStatus } from '../enums/closure-status.enum';

// El cobrador (`collector`) no se recibe en el body porque se toma del usuario autenticado.
export class CreateClosureDto {
  @IsNumber()
  societyId: number; // Identificador de la sociedad asociada

  @IsNumber()
  totalCollected: number; // Total recaudado en el cierre

  @IsNumber()
  totalExpenses: number; // Gastos del cobrador en el cierre

  @IsNumber()
  netAmount: number; // Monto neto a rendir

  @IsDateString()
  closureDate: string; // Fecha del cierre

  @IsEnum(ClosureStatus)
  @IsOptional()
  status?: ClosureStatus; // Estado del cierre, por defecto PENDING

  @IsOptional()
  @IsNumber()
  approvedBy?: number; // Staff que aprobó el cierre (opcional)
}
