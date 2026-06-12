import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StaffZone, StaffZoneStatus } from '../entities/staff-zone.entity';
import { IStaffZonesRepository } from '../interfaces/staff-zones-repository.interface';

@Injectable()
export class StaffZonesRepository implements IStaffZonesRepository {
  constructor(
    @InjectRepository(StaffZone)
    private readonly repo: Repository<StaffZone>,
  ) {}

  findByZone(zoneId: string): Promise<any[]> {
    return this.repo.manager
      .createQueryBuilder()
      .select('sz.staff_id', 'staffId')
      .addSelect('s.name', 'name')
      .addSelect('s.email', 'email')
      .addSelect('s.role', 'role')
      .addSelect('sz.status', 'status')
      .addSelect('sz.assigned_at', 'assignedAt')
      .from('STAFF_ZONES', 'sz')
      .innerJoin('STAFF', 's', 's.staff_id = sz.staff_id')
      .where('sz.zone_id = :zoneId', { zoneId })
      .andWhere('sz.status = :status', { status: StaffZoneStatus.ACTIVE })
      .orderBy('s.name', 'ASC')
      .getRawMany();
  }

  async assign(staffId: string, zoneId: string, status: StaffZoneStatus): Promise<void> {
    const existing = await this.repo.findOne({ where: { staffId, zoneId } });
    if (existing) {
      await this.repo.update({ staffZoneId: existing.staffZoneId }, { status });
    } else {
      await this.repo.save(this.repo.create({ staffId, zoneId, status }));
    }
  }

  async unassign(staffId: string, zoneId: string): Promise<void> {
    await this.repo.update({ staffId, zoneId }, { status: StaffZoneStatus.INACTIVE });
  }
}
