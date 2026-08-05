import { Supplier } from '../entities/supplier.entity';

export interface ISuppliersRepository {
  create(data: Partial<Supplier>): Promise<Supplier>;
  findById(id: string): Promise<Supplier | null>;
  findBySociety(societyId: string, activeOnly?: boolean): Promise<Supplier[]>;
  update(id: string, data: Partial<Supplier>): Promise<void>;
  setActive(id: string, active: boolean): Promise<void>;
}

export const SUPPLIERS_REPOSITORY = 'ISuppliersRepository';
