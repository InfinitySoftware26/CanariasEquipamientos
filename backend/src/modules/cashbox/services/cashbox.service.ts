import { Injectable, Inject, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ICashboxRepository, CASHBOX_REPOSITORY } from '../interfaces/cashbox-repository.interface';
import { Cashbox } from '../entities/cashbox.entity';
import { CashMovement } from '../../cash-movements/entities/cash-movement.entity';
import { OpenCashboxDto } from '../dto/open-cashbox.dto';
import { CloseCashboxDto } from '../dto/close-cashbox.dto';
import { CashboxStatus } from '../../../common/enums/cashbox-status.enum';
import { CashMovementType } from '../../../common/enums/cash-movement-type.enum';
import { JwtPayload } from '../../auth/interfaces/jwt-payload.interface';

@Injectable()
export class CashboxService {
  constructor(
    @Inject(CASHBOX_REPOSITORY)
    private readonly cashboxRepo: ICashboxRepository,
    @InjectRepository(CashMovement)
    private readonly cashMovementRepo: Repository<CashMovement>,
  ) {}

  findBySociety(societyId: string): Promise<Cashbox[]> {
    return this.cashboxRepo.findBySociety(societyId);
  }

  async findById(id: string): Promise<Cashbox> {
    const cashbox = await this.cashboxRepo.findById(id);
    if (!cashbox) throw new NotFoundException(`Caja ${id} no encontrada`);
    return cashbox;
  }

  async findOpen(societyId: string): Promise<Cashbox> {
    const cashbox = await this.cashboxRepo.findOpenForSociety(societyId);
    if (!cashbox) throw new NotFoundException('No hay una caja abierta para esta sociedad');
    return cashbox;
  }

  async open(dto: OpenCashboxDto, user: JwtPayload): Promise<Cashbox> {
    const existing = await this.cashboxRepo.findOpenForSociety(user.societyId);
    if (existing) {
      throw new ConflictException('Ya existe una caja abierta para esta sociedad');
    }

    return this.cashboxRepo.create({
      societyId: user.societyId,
      staffId: user.sub,
      openingDate: new Date(),
      openingBalance: dto.openingBalance,
      status: CashboxStatus.OPEN,
      notes: dto.notes,
    });
  }

  async close(id: string, dto: CloseCashboxDto): Promise<void> {
    const cashbox = await this.findById(id);
    if (cashbox.status !== CashboxStatus.OPEN) {
      throw new BadRequestException('La caja ya se encuentra cerrada');
    }

    await this.cashboxRepo.updateStatus(id, CashboxStatus.CLOSED, dto.closingBalance);
  }

  /**
   * Saldo calculado por el sistema en base a los movimientos registrados —
   * ingresos suman, egresos y transferencias salientes restan.
   */
  async getBalance(id: string): Promise<{ openingBalance: number; systemBalance: number; declaredClosingBalance: number | null }> {
    const cashbox = await this.findById(id);

    const movements = await this.cashMovementRepo.find({ where: { cashboxId: id } });
    const net = movements.reduce((sum, m) => {
      const amount = Number(m.amount);
      return m.type === CashMovementType.INCOME ? sum + amount : sum - amount;
    }, 0);

    return {
      openingBalance: Number(cashbox.openingBalance),
      systemBalance: Number(cashbox.openingBalance) + net,
      declaredClosingBalance: cashbox.closingBalance != null ? Number(cashbox.closingBalance) : null,
    };
  }
}
