import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IFailedVisitsRepository, FAILED_VISITS_REPOSITORY } from '../interfaces/failed-visits-repository.interface';
import { FailedVisit } from '../entities/failed-visit.entity';
import { CreateFailedVisitDto } from '../dto/create-failed-visit.dto';
import { FailedVisitReason } from '../../../common/enums/failed-visit-reason.enum';
import { JwtPayload } from '../../auth/interfaces/jwt-payload.interface';

export interface RecordFailedVisitParams {
  routeSheetItemId: string;
  clientId: string;
  staffId: string;
  societyId: string;
  installmentId?: string;
  reason?: FailedVisitReason;
  notes?: string;
}

@Injectable()
export class FailedVisitsService {
  constructor(
    @Inject(FAILED_VISITS_REPOSITORY)
    private readonly failedVisitsRepo: IFailedVisitsRepository,
  ) {}

  async findById(id: string): Promise<FailedVisit> {
    const visit = await this.failedVisitsRepo.findById(id);
    if (!visit) throw new NotFoundException(`Visita fallida ${id} no encontrada`);
    return visit;
  }

  findByRouteSheetItem(routeSheetItemId: string): Promise<FailedVisit[]> {
    return this.failedVisitsRepo.findByRouteSheetItem(routeSheetItemId);
  }

  findBySociety(societyId: string): Promise<FailedVisit[]> {
    return this.failedVisitsRepo.findBySociety(societyId);
  }

  async create(dto: CreateFailedVisitDto, user: JwtPayload): Promise<FailedVisit> {
    return this.record({
      routeSheetItemId: dto.routeSheetItemId,
      clientId: dto.clientId,
      installmentId: dto.installmentId,
      staffId: user.sub,
      societyId: user.societyId,
      reason: dto.reason,
      notes: dto.notes,
    });
  }

  /**
   * Usado por RouteSheetItemsService cuando itemType=installment y result=failed:
   * registra la visita fallida llevando la cuenta de intentos por ítem, análogo a
   * DeliveryAttempt para entregas.
   */
  async record(params: RecordFailedVisitParams): Promise<FailedVisit> {
    const attemptCount = await this.failedVisitsRepo.countByRouteSheetItem(params.routeSheetItemId);

    return this.failedVisitsRepo.create({
      routeSheetItemId: params.routeSheetItemId,
      clientId: params.clientId,
      installmentId: params.installmentId,
      staffId: params.staffId,
      societyId: params.societyId,
      reason: params.reason ?? FailedVisitReason.OTHER,
      notes: params.notes,
      attemptNumber: attemptCount + 1,
    });
  }

  async reschedule(id: string, rescheduledDate: string): Promise<void> {
    await this.findById(id);
    await this.failedVisitsRepo.updateReschedule(id, rescheduledDate);
  }
}
