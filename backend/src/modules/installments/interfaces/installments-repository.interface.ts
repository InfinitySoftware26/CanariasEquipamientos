import { Installment } from '../entities/installment.entity';
import { InstallmentStatus } from '../../../common/enums/installment-status.enum';

export interface IInstallmentsRepository {
  findBySale(saleId: string): Promise<Installment[]>;
  findByClient(clientId: string, societyId: string): Promise<Installment[]>;
  findOverdue(societyId: string): Promise<Installment[]>;
  findPendingBySociety(societyId: string): Promise<Installment[]>;
  findById(id: string): Promise<Installment | null>;
  createMany(data: Partial<Installment>[]): Promise<Installment[]>;
  updateStatus(id: string, status: InstallmentStatus, paidAmount?: number): Promise<void>;
}

export const INSTALLMENTS_REPOSITORY = 'IInstallmentsRepository';
