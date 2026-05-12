import { IsEnum } from 'class-validator';
import { stockalertStatus } from '../stockalerts.repository';

export class UpdateStockalertDto {
  @IsEnum(stockalertStatus)
  status: stockalertStatus;
}
