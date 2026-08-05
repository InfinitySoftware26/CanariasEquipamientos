import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { ISuppliersRepository, SUPPLIERS_REPOSITORY } from '../interfaces/suppliers-repository.interface';
import { Supplier } from '../entities/supplier.entity';
import { CreateSupplierDto } from '../dto/create-supplier.dto';
import { UpdateSupplierDto } from '../dto/update-supplier.dto';

@Injectable()
export class SuppliersService {
  constructor(
    @Inject(SUPPLIERS_REPOSITORY)
    private readonly suppliersRepo: ISuppliersRepository,
  ) {}

  findBySociety(societyId: string, activeOnly?: boolean): Promise<Supplier[]> {
    return this.suppliersRepo.findBySociety(societyId, activeOnly);
  }

  async findById(id: string): Promise<Supplier> {
    const supplier = await this.suppliersRepo.findById(id);
    if (!supplier) throw new NotFoundException(`Proveedor ${id} no encontrado`);
    return supplier;
  }

  create(dto: CreateSupplierDto, societyId: string): Promise<Supplier> {
    return this.suppliersRepo.create({ ...dto, societyId, active: true });
  }

  async update(id: string, dto: UpdateSupplierDto): Promise<void> {
    await this.findById(id);
    await this.suppliersRepo.update(id, dto);
  }

  async setActive(id: string, active: boolean): Promise<void> {
    await this.findById(id);
    await this.suppliersRepo.setActive(id, active);
  }
}
