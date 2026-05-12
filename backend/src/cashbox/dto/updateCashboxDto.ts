import { IsUUID, IsDateString, IsNumber, IsEnum, Min } from 'class-validator';
import { CashboxStatus } from '../enums/cashbox-status.enum';

export class AddCashboxDto {
  @IsUUID()
  id: string;

  @IsDateString()
  date: string; // fecha de apertura/cierre

  @IsNumber()
  @Min(0)
  openingBalance: number; //apertura de caja

  @IsNumber()
  @Min(0)
  closingBalance: number; //cierre de caja

  @IsEnum(CashboxStatus)
  status: CashboxStatus; // estado de la caja (abierta o cerrada)
}
