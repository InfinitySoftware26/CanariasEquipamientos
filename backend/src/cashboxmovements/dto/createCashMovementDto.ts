import { IsEnum, IsNumber } from 'class-validator';
import { CashboxMovementType } from '../enums/cashbox-movement-type.enum';
import { CashboxMovementCategory } from '../enums/cashbox-movement-category.enum';

export class CreateCashboxMovementDto {
  @IsEnum(CashboxMovementType)
  type: CashboxMovementType; // income or expense

  @IsNumber()
  amount: number; // movement amount

  @IsEnum(CashboxMovementCategory)
  category: CashboxMovementCategory; // supplier payment, expense or supplies

  @IsNumber()
  societyId: number; // corresponding society
}
