import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, LessThan, Repository } from 'typeorm';
import { Installment } from '../entities/installment.entity';
import { IInstallmentsRepository } from '../interfaces/installments-repository.interface';
import { InstallmentStatus } from '../../../common/enums/installment-status.enum';

@Injectable()
export class InstallmentsRepository implements IInstallmentsRepository {
  constructor(@InjectRepository(Installment) private readonly repo: Repository<Installment>) {}

  findBySale(saleId: string): Promise<Installment[]> {
    return this.repo.find({ where: { saleId }, order: { installmentNumber: 'ASC' } });
  }

  findByClient(clientId: string, societyId: string): Promise<Installment[]> {
    return this.repo.find({
      where: { clientId, societyId },
      order: { dueDate: 'ASC' },
    });
  }

  findOverdue(societyId: string): Promise<Installment[]> {
    return this.repo.find({
      where: {
        societyId,
        status: InstallmentStatus.OVERDUE,
        dueDate: LessThan(new Date()),
      },
      order: { dueDate: 'ASC' },
    });
  }

  findPendingBySociety(societyId: string): Promise<Installment[]> {
    return this.repo.find({
      where: {
        societyId,
        status: In([InstallmentStatus.PENDING, InstallmentStatus.OVERDUE, InstallmentStatus.PARTIAL]),
      },
      order: { dueDate: 'ASC' },
    });
  }

  findById(id: string): Promise<Installment | null> {
    return this.repo.findOne({ where: { installmentId: id } });
  }

  async createMany(data: Partial<Installment>[]): Promise<Installment[]> {
    return this.repo.save(data.map(d => this.repo.create(d)));
  }

  async updateStatus(id: string, status: InstallmentStatus, paidAmount?: number): Promise<void> {
    const updates: Partial<Installment> = { status };
    if (paidAmount !== undefined) {
      updates.paidAmount = paidAmount;
    }
    await this.repo.update({ installmentId: id }, updates);
    if (paidAmount !== undefined) {
      const inst = await this.repo.findOneOrFail({ where: { installmentId: id } });
      await this.repo.update(
        { installmentId: id },
        { remainingAmount: Number(inst.amount) - paidAmount },
      );
    }
  }
}
