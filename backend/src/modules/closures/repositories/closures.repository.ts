import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DailyClosure } from '../entities/daily-closure.entity';
import { IClosuresRepository, ClosureFilters } from '../interfaces/closures-repository.interface';
import { DailyClosureStatus } from '../../../common/enums/daily-closure-status.enum';

@Injectable()
export class ClosuresRepository implements IClosuresRepository {
  constructor(
    @InjectRepository(DailyClosure) private readonly repo: Repository<DailyClosure>,
  ) {}

  findBySociety(societyId: string, filters?: ClosureFilters): Promise<DailyClosure[]> {
    return this.repo.find({
      where: {
        societyId,
        ...(filters?.status ? { status: filters.status } : {}),
        ...(filters?.closingDate ? { closingDate: filters.closingDate as unknown as Date } : {}),
      },
      order: { closingDate: 'DESC' },
    });
  }

  findByStaff(staffId: string, societyId: string, filters?: ClosureFilters): Promise<DailyClosure[]> {
    return this.repo.find({
      where: {
        staffId,
        societyId,
        ...(filters?.status ? { status: filters.status } : {}),
        ...(filters?.closingDate ? { closingDate: filters.closingDate as unknown as Date } : {}),
      },
      order: { closingDate: 'DESC' },
    });
  }

  findById(id: string): Promise<DailyClosure | null> {
    return this.repo.findOne({ where: { closureId: id } });
  }

  findByStaffAndDate(staffId: string, closingDate: string): Promise<DailyClosure | null> {
    return this.repo.findOne({
      where: { staffId, closingDate: closingDate as unknown as Date },
    });
  }

  async create(data: Partial<DailyClosure>): Promise<DailyClosure> {
    return this.repo.save(this.repo.create(data));
  }

  async updateStatus(id: string, status: DailyClosureStatus, validatedBy: string): Promise<void> {
    await this.repo.update({ closureId: id }, { status, validatedBy });
  }
}
