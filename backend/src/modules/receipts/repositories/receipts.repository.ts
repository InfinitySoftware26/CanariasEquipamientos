import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Receipt } from '../entities/receipt.entity';
import { IReceiptsRepository } from '../interfaces/receipts-repository.interface';

@Injectable()
export class ReceiptsRepository implements IReceiptsRepository {
  constructor(@InjectRepository(Receipt) private readonly repo: Repository<Receipt>) {}

  async create(data: Partial<Receipt>): Promise<Receipt> {
    return this.repo.save(this.repo.create(data));
  }

  findById(id: string): Promise<Receipt | null> {
    return this.repo.findOne({ where: { receiptId: id } });
  }

  findBySociety(societyId: string): Promise<Receipt[]> {
    return this.repo.find({ where: { societyId }, order: { receiptNumber: 'DESC' } });
  }

  async findLastNumberForSociety(societyId: string): Promise<number> {
    const raw = await this.repo
      .createQueryBuilder('r')
      .select('COALESCE(MAX(r.receipt_number), 0)', 'max')
      .where('r.society_id = :societyId', { societyId })
      .getRawOne<{ max: string }>();
    return Number(raw?.max ?? 0);
  }
}
