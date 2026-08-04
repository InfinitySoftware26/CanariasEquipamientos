import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { IInstallmentsRepository, INSTALLMENTS_REPOSITORY } from '../interfaces/installments-repository.interface';
import { Installment } from '../entities/installment.entity';
import { InstallmentStatus } from '../../../common/enums/installment-status.enum';

@Injectable()
export class InstallmentsService {
  constructor(
    @Inject(INSTALLMENTS_REPOSITORY)
    private readonly installmentsRepo: IInstallmentsRepository,
  ) {}

  findBySale(saleId: string): Promise<Installment[]> {
    return this.installmentsRepo.findBySale(saleId);
  }

  findByClient(clientId: string, societyId: string): Promise<Installment[]> {
    return this.installmentsRepo.findByClient(clientId, societyId);
  }

  findOverdue(societyId: string): Promise<Installment[]> {
    return this.installmentsRepo.findOverdue(societyId);
  }

  findPendingBySociety(societyId: string): Promise<Installment[]> {
    return this.installmentsRepo.findPendingBySociety(societyId);
  }

  async findById(id: string): Promise<Installment> {
    const inst = await this.installmentsRepo.findById(id);
    if (!inst) throw new NotFoundException(`Cuota ${id} no encontrada`);
    return inst;
  }

  async payInstallment(id: string, amount: number): Promise<void> {
    const inst = await this.findById(id);

    if (inst.status === InstallmentStatus.PAID) {
      throw new BadRequestException('La cuota ya se encuentra pagada');
    }

    const totalPaid = Number(inst.paidAmount) + amount;
    const installmentAmount = Number(inst.amount);

    let newStatus: InstallmentStatus;
    if (totalPaid >= installmentAmount) {
      newStatus = InstallmentStatus.PAID;
    } else {
      newStatus = InstallmentStatus.PARTIAL;
    }

    await this.installmentsRepo.updateStatus(id, newStatus, totalPaid);
  }
}
