import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import {
  ICashMovementsRepository, CASH_MOVEMENTS_REPOSITORY,
} from '../interfaces/cash-movements-repository.interface';
import { CashMovement } from '../entities/cash-movement.entity';
import { CreateCashMovementDto } from '../dto/create-cash-movement.dto';
import { CashboxService } from '../../cashbox/services/cashbox.service';
import { JwtPayload } from '../../auth/interfaces/jwt-payload.interface';
import { CashboxStatus } from '../../../common/enums/cashbox-status.enum';
import { societyScopeOf } from '../../../common/utils/society-scope.util';

@Injectable()
export class CashMovementsService {
  constructor(
    @Inject(CASH_MOVEMENTS_REPOSITORY)
    private readonly cashMovementsRepo: ICashMovementsRepository,
    private readonly cashboxService: CashboxService,
  ) {}

  /** La caja debe pertenecer a la sociedad (404 si no) antes de listar. */
  async findByCashbox(cashboxId: string, societyId?: string): Promise<CashMovement[]> {
    await this.cashboxService.findById(cashboxId, societyId);
    return this.cashMovementsRepo.findByCashbox(cashboxId);
  }

  findBySociety(societyId: string, from?: string, to?: string): Promise<CashMovement[]> {
    return this.cashMovementsRepo.findBySociety(societyId, from, to);
  }

  /**
   * La caja debe pertenecer a la sociedad del usuario (si no, 404) y estar
   * abierta. SUPER_ADMIN puede operar sobre cualquier caja: el movimiento se
   * registra en la sociedad de la caja, no en la del token.
   */
  async create(dto: CreateCashMovementDto, user: JwtPayload): Promise<CashMovement> {
    const cashbox = await this.cashboxService.findById(dto.cashboxId, societyScopeOf(user));

    if (cashbox.status !== CashboxStatus.OPEN) {
      throw new BadRequestException('La caja está cerrada: no admite nuevos movimientos');
    }

    return this.cashMovementsRepo.create({
      cashboxId: cashbox.cashboxId,
      societyId: cashbox.societyId,
      staffId: user.sub,
      type: dto.type,
      amount: dto.amount,
      concept: dto.concept,
      relatedPaymentId: dto.relatedPaymentId,
      relatedSupplierPaymentId: dto.relatedSupplierPaymentId,
    });
  }
}
