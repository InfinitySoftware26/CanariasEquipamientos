import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryRunner } from 'typeorm';
import { Sale } from '../entities/sale.entity';
import { ISalesRepository } from '../interfaces/sales-repository.interface';
import { SaleStatus } from '../../../common/enums/sale-status.enum';

@Injectable()
export class SalesRepository implements ISalesRepository {
  constructor(@InjectRepository(Sale) private readonly repo: Repository<Sale>) {}

  findById(id: string)                              { return this.repo.findOne({ where: { saleId: id } }); }
  findByClient(clientId: string, societyId: string) { return this.repo.find({ where: { clientId, societyId } }); }
  findPendingValidation(societyId: string)          { return this.repo.find({ where: { societyId, status: SaleStatus.PENDING }, order: { saleDate: 'ASC' } }); }
  findActiveByClient(clientId: string)              { return this.repo.find({ where: { clientId, status: SaleStatus.APPROVED } }); }

  async create(data: Partial<Sale>, qr?: QueryRunner): Promise<Sale> {
    const r = qr ? qr.manager.getRepository(Sale) : this.repo;
    return r.save(r.create(data));
  }

  async updateStatus(id: string, status: SaleStatus, qr?: QueryRunner): Promise<void> {
    const r = qr ? qr.manager.getRepository(Sale) : this.repo;
    await r.update({ saleId: id }, { status });
  }
}
