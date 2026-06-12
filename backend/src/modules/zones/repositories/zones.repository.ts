import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Zone, ZoneStatus } from '../entities/zone.entity';
import { IZonesRepository } from '../interfaces/zones-repository.interface';

@Injectable()
export class ZonesRepository implements IZonesRepository {
  constructor(
    @InjectRepository(Zone)
    private readonly repo: Repository<Zone>,
  ) {}

  findBySociety(societyId: string): Promise<Zone[]> {
    return this.repo.find({ where: { societyId }, order: { name: 'ASC' } });
  }

  findById(id: string): Promise<Zone | null> {
    return this.repo.findOne({ where: { zoneId: id } });
  }

  findByNameAndSociety(name: string, societyId: string): Promise<Zone | null> {
    return this.repo.findOne({ where: { name, societyId } });
  }

  async create(data: Partial<Zone>): Promise<Zone> {
    return this.repo.save(this.repo.create(data));
  }

  async update(id: string, data: Partial<Zone>): Promise<Zone> {
    await this.repo.update({ zoneId: id }, data);
    const updated = await this.repo.findOne({ where: { zoneId: id } });
    if (!updated) throw new NotFoundException('Zona no encontrada');
    return updated;
  }

  async softDelete(id: string): Promise<void> {
    await this.repo.update({ zoneId: id }, { status: ZoneStatus.INACTIVE });
  }
}
