import { Injectable, Inject } from '@nestjs/common';
import {
  ICashMovementsRepository, CASH_MOVEMENTS_REPOSITORY,
} from '../interfaces/cash-movements-repository.interface';
import { CashMovement } from '../entities/cash-movement.entity';
import { CreateCashMovementDto } from '../dto/create-cash-movement.dto';
import { CashboxService } from '../../cashbox/services/cashbox.service';
import { JwtPayload } from '../../auth/interfaces/jwt-payload.interface';

@Injectable()
export class CashMovementsService {
  constructor(
    @Inject(CASH_MOVEMENTS_REPOSITORY)
    private readonly cashMovementsRepo: ICashMovementsRepository,
    private readonly cashboxService: CashboxService,
  ) {}

  findByCashbox(cashboxId: string): Promise<CashMovement[]> {
    return this.cashMovementsRepo.findByCashbox(cashboxId);
  }

  findBySociety(societyId: string, from?: string, to?: string): Promise<CashMovement[]> {
    return this.cashMovementsRepo.findBySociety(societyId, from, to);
  }

  async create(dto: CreateCashMovementDto, user: JwtPayload): Promise<CashMovement> {
    await this.cashboxService.findById(dto.cashboxId);

    return this.cashMovementsRepo.create({
      cashboxId: dto.cashboxId,
      societyId: user.societyId,
      staffId: user.sub,
      type: dto.type,
      amount: dto.amount,
      concept: dto.concept,
      relatedPaymentId: dto.relatedPaymentId,
      relatedSupplierPaymentId: dto.relatedSupplierPaymentId,
    });
  }
}
