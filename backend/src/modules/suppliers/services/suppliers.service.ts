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

  /**
   * societyId opcional: si se pasa, un registro de otra sociedad responde 404
   * (no 403) para no revelar su existencia. Ver common/utils/society-scope.util.
   */
  async findById(id: string, societyId?: string): Promise<Supplier> {
    const supplier = await this.suppliersRepo.findById(id, societyId);
    if (!supplier) throw new NotFoundException(`Proveedor ${id} no encontrado`);
    return supplier;
  }

  create(dto: CreateSupplierDto, societyId: string): Promise<Supplier> {
    return this.suppliersRepo.create({ ...dto, societyId, active: true });
  }

  async update(id: string, dto: UpdateSupplierDto, societyId?: string): Promise<void> {
    await this.findById(id, societyId);
    await this.suppliersRepo.update(id, dto);
  }

  async setActive(id: string, active: boolean, societyId?: string): Promise<void> {
    await this.findById(id, societyId);
    await this.suppliersRepo.setActive(id, active);
  }
}
