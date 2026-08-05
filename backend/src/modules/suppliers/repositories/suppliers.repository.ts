import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Supplier } from '../entities/supplier.entity';
import { ISuppliersRepository } from '../interfaces/suppliers-repository.interface';

@Injectable()
export class SuppliersRepository implements ISuppliersRepository {
  constructor(@InjectRepository(Supplier) private readonly repo: Repository<Supplier>) {}

  async create(data: Partial<Supplier>): Promise<Supplier> {
    return this.repo.save(this.repo.create(data));
  }

  findById(id: string): Promise<Supplier | null> {
    return this.repo.findOne({ where: { supplierId: id } });
  }

  findBySociety(societyId: string, activeOnly?: boolean): Promise<Supplier[]> {
    return this.repo.find({
      where: { societyId, ...(activeOnly ? { active: true } : {}) },
      order: { name: 'ASC' },
    });
  }

  async update(id: string, data: Partial<Supplier>): Promise<void> {
    await this.repo.update({ supplierId: id }, data);
  }

  async setActive(id: string, active: boolean): Promise<void> {
    await this.repo.update({ supplierId: id }, { active });
  }
}
