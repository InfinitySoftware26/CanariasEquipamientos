import { SaleValidation } from '../entities/sale-validation.entity';
import { ValidationStep } from '../../../common/enums/validation-step.enum';
import { ValidationStatus } from '../../../common/enums/validation-status.enum';

export interface ISaleValidationsRepository {
  create(data: {
    saleId: string;
    staffId: string;
    step: ValidationStep;
    status: ValidationStatus;
    observations?: string;
    validatedAt: Date;
  }): Promise<SaleValidation>;
  findBySale(saleId: string): Promise<SaleValidation[]>;
}

export const SALE_VALIDATIONS_REPOSITORY = 'ISaleValidationsRepository';
