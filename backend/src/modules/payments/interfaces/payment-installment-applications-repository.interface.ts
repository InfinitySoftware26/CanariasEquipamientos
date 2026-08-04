import { PaymentInstallmentApplication } from '../entities/payment-installment-application.entity';

export interface IPaymentInstallmentApplicationsRepository {
  create(data: Partial<PaymentInstallmentApplication>): Promise<PaymentInstallmentApplication>;
  findByPayment(paymentId: string): Promise<PaymentInstallmentApplication[]>;
  findByInstallment(installmentId: string): Promise<PaymentInstallmentApplication[]>;
  sumByPayment(paymentId: string): Promise<number>;
}

export const PAYMENT_INSTALLMENT_APPLICATIONS_REPOSITORY = 'IPaymentInstallmentApplicationsRepository';
