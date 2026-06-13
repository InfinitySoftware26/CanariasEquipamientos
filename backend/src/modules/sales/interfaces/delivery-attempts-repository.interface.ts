import { DeliveryAttempt } from '../entities/delivery-attempt.entity';

export interface IDeliveryAttemptsRepository {
  create(data: {
    saleId: string;
    staffId: string;
    attemptNumber: number;
    reason: string;
    attemptedAt: Date;
  }): Promise<DeliveryAttempt>;
  findBySale(saleId: string): Promise<DeliveryAttempt[]>;
  countBySale(saleId: string): Promise<number>;
}

export const DELIVERY_ATTEMPTS_REPOSITORY = 'IDeliveryAttemptsRepository';
