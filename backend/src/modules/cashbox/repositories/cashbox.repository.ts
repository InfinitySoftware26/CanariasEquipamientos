import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cashbox } from '../entities/cashbox.entity';
import { ICashboxRepository } from '../interfaces/cashbox-repository.interface';
import { CashboxStatus } from '../../../common/enums/cashbox-status.enum';

@Injectable()
export class CashboxRepository implements ICashboxRepository {
  constructor(@InjectRepository(Cashbox) private readonly repo: Repository<Cashbox>) {}

  async create(data: Partial<Cashbox>): Promise<Cashbox> {
    return this.repo.save(this.repo.create(data));
  }

  findById(id: string): Promise<Cashbox | null> {
    return this.repo.findOne({ where: { cashboxId: id } });
  }

  findBySociety(societyId: string): Promise<Cashbox[]> {
    return this.repo.find({ where: { societyId }, order: { openingDate: 'DESC' } });
  }

  findOpenForSociety(societyId: string): Promise<Cashbox | null> {
    return this.repo.findOne({ where: { societyId, status: CashboxStatus.OPEN } });
  }

  async updateStatus(id: string, status: CashboxStatus, closingBalance?: number): Promise<void> {
    const updates: Partial<Cashbox> = { status };
    if (status === CashboxStatus.CLOSED) {
      updates.closedAt = new Date();
      if (closingBalance !== undefined) updates.closingBalance = closingBalance;
    }
    await this.repo.update({ cashboxId: id }, updates);
  }
}
