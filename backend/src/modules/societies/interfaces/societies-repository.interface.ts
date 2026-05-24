import { Society } from '../entities/society.entity';
import { QueryRunner } from 'typeorm';

export interface ISocietiesRepository {
  findAll(): Promise<Society[]>;
  findById(id: string): Promise<Society | null>;
  findByTaxId(taxId: string): Promise<Society | null>;
  create(data: Partial<Society>, qr?: QueryRunner): Promise<Society>;
  update(id: string, data: Partial<Society>, qr?: QueryRunner): Promise<Society>;
  softDelete(id: string): Promise<void>;
}

export const SOCIETIES_REPOSITORY = 'ISocietiesRepository';
