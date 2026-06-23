import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sale } from '../entities/sale.entity';
import { ISalesRepository } from '../interfaces/sales-repository.interface';
import { SaleStatus } from '../../../common/enums/sale-status.enum';

const SALE_RELATIONS = ['client', 'products', 'products.product'];

@Injectable()
export class SalesRepository implements ISalesRepository {
  constructor(@InjectRepository(Sale) private readonly repo: Repository<Sale>) {}

  findById(id: string): Promise<Sale | null> {
    return this.repo.findOne({ where: { saleId: id }, relations: SALE_RELATIONS });
  }

  findByClient(clientId: string, societyId: string): Promise<Sale[]> {
    return this.repo.find({ where: { clientId, societyId }, order: { saleDate: 'DESC' }, relations: SALE_RELATIONS });
  }

  findBySociety(societyId: string): Promise<Sale[]> {
    return this.repo.find({ where: { societyId }, order: { saleDate: 'DESC' }, relations: SALE_RELATIONS });
  }

  findByStatus(societyId: string, status: SaleStatus): Promise<Sale[]> {
    return this.repo.find({ where: { societyId, status }, order: { saleDate: 'ASC' }, relations: SALE_RELATIONS });
  }

  findPendingValidation(societyId: string): Promise<Sale[]> {
    return this.repo.find({
      where: { societyId, status: SaleStatus.PENDING_ADMIN_VALIDATION },
      order: { saleDate: 'ASC' },
      relations: SALE_RELATIONS,
    });
  }

  findBySeller(staffId: string, societyId: string): Promise<Sale[]> {
    return this.repo.find({ where: { staffId, societyId }, order: { saleDate: 'DESC' }, relations: SALE_RELATIONS });
  }

  findByCollector(collectorId: string, societyId: string): Promise<Sale[]> {
    return this.repo.find({
      where: { assignedCollectorId: collectorId, societyId },
      order: { saleDate: 'DESC' },
      relations: SALE_RELATIONS,
    });
  }

  findActiveByClient(clientId: string): Promise<Sale[]> {
    return this.repo.find({
      where: [
        { clientId, status: SaleStatus.PENDING_ADMIN_VALIDATION },
        { clientId, status: SaleStatus.PENDING_ENVIRONMENTAL_VISIT },
        { clientId, status: SaleStatus.PENDING_DELIVERY },
        { clientId, status: SaleStatus.DELIVERED },
      ],
      relations: SALE_RELATIONS,
    });
  }

  async create(data: Partial<Sale>): Promise<Sale> {
    return this.repo.save(this.repo.create(data));
  }

  async update(id: string, data: Partial<Sale>): Promise<void> {
    await this.repo.update({ saleId: id }, data);
  }

  async updateStatus(id: string, status: SaleStatus): Promise<void> {
    await this.repo.update({ saleId: id }, { status });
  }
}
