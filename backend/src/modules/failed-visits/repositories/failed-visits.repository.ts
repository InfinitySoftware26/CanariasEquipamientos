import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FailedVisit } from '../entities/failed-visit.entity';
import { IFailedVisitsRepository } from '../interfaces/failed-visits-repository.interface';

@Injectable()
export class FailedVisitsRepository implements IFailedVisitsRepository {
  constructor(@InjectRepository(FailedVisit) private readonly repo: Repository<FailedVisit>) {}

  async create(data: Partial<FailedVisit>): Promise<FailedVisit> {
    return this.repo.save(this.repo.create(data));
  }

  findById(id: string): Promise<FailedVisit | null> {
    return this.repo.findOne({ where: { failedVisitId: id } });
  }

  findByRouteSheetItem(routeSheetItemId: string): Promise<FailedVisit[]> {
    return this.repo.find({ where: { routeSheetItemId }, order: { attemptNumber: 'ASC' } });
  }

  findBySociety(societyId: string): Promise<FailedVisit[]> {
    return this.repo.find({ where: { societyId }, order: { createdAt: 'DESC' } });
  }

  countByRouteSheetItem(routeSheetItemId: string): Promise<number> {
    return this.repo.count({ where: { routeSheetItemId } });
  }

  async updateReschedule(id: string, rescheduledDate: string): Promise<void> {
    await this.repo.update({ failedVisitId: id }, { rescheduledDate: rescheduledDate as unknown as Date });
  }
}
