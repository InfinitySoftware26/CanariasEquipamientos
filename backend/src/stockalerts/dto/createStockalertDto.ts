import { IsString, IsEnum, IsDateString } from 'class-validator';
import { stockalertStatus } from '../stockalerts.repository';

export class CreateStockalertDto {
  @IsString()
  product: string;

  @IsDateString()
  date: string;

  @IsString()
  supplier: string;

  @IsEnum(stockalertStatus)
  status: stockalertStatus;
}
