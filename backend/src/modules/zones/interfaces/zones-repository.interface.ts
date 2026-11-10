import { Zone } from '../entities/zone.entity';

export interface IZonesRepository {
  findBySociety(societyId: string): Promise<Zone[]>;
  /** societyId opcional: si se pasa, filtra por sociedad en la consulta. */
  findById(id: string, societyId?: string): Promise<Zone | null>;
  findByNameAndSociety(name: string, societyId: string): Promise<Zone | null>;
  create(data: Partial<Zone>): Promise<Zone>;
  update(id: string, data: Partial<Zone>): Promise<Zone>;
  softDelete(id: string): Promise<void>;
}

export const ZONES_REPOSITORY = 'IZonesRepository';
