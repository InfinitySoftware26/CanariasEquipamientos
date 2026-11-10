import { Supplier } from '../entities/supplier.entity';

export interface ISuppliersRepository {
  create(data: Partial<Supplier>): Promise<Supplier>;
  /** societyId opcional: si se pasa, filtra por sociedad en la consulta. */
  findById(id: string, societyId?: string): Promise<Supplier | null>;
  findBySociety(societyId: string, activeOnly?: boolean): Promise<Supplier[]>;
  update(id: string, data: Partial<Supplier>): Promise<void>;
  setActive(id: string, active: boolean): Promise<void>;
}

export const SUPPLIERS_REPOSITORY = 'ISuppliersRepository';
