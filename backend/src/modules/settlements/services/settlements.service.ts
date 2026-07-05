import { Injectable, Inject, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { ISettlementsRepository, SETTLEMENTS_REPOSITORY, SettlementFilters } from '../interfaces/settlements-repository.interface';
import { CreateSettlementDto } from '../dto/create-settlement.dto';
import { ValidateSettlementDto } from '../dto/validate-settlement.dto';
import { Settlement } from '../entities/settlement.entity';
import { SettlementStatus } from '../../../common/enums/settlement-status.enum';
import { DailyClosureStatus } from '../../../common/enums/daily-closure-status.enum';
import { RouteSheetItemType } from '../../../common/enums/route-sheet-item-type.enum';
import { DailyClosure } from '../../closures/entities/daily-closure.entity';
import { RouteSheet } from '../../route-sheets/entities/route-sheet.entity';
import { RouteSheetItem } from '../../route-sheets/entities/route-sheet-item.entity';
import { Installment } from '../../installments/entities/installment.entity';

@Injectable()
export class SettlementsService {
  constructor(
    @Inject(SETTLEMENTS_REPOSITORY)
    private readonly settlementsRepo: ISettlementsRepository,
    @InjectRepository(DailyClosure) private readonly closureRepo: Repository<DailyClosure>,
    @InjectRepository(RouteSheet) private readonly routeSheetRepo: Repository<RouteSheet>,
    @InjectRepository(RouteSheetItem) private readonly routeSheetItemRepo: Repository<RouteSheetItem>,
    @InjectRepository(Installment) private readonly installmentRepo: Repository<Installment>,
  ) {}

  findBySociety(societyId: string, filters?: SettlementFilters): Promise<Settlement[]> {
    return this.settlementsRepo.findBySociety(societyId, filters);
  }

  async findById(id: string): Promise<Settlement> {
    const settlement = await this.settlementsRepo.findById(id);
    if (!settlement) throw new NotFoundException(`Liquidación ${id} no encontrada`);
    return settlement;
  }

  async create(dto: CreateSettlementDto): Promise<Settlement> {
    const closure = await this.closureRepo.findOne({ where: { closureId: dto.closureId } });
    if (!closure) throw new NotFoundException(`Cierre ${dto.closureId} no encontrado`);
    if (closure.status !== DailyClosureStatus.VALIDATED) {
      throw new BadRequestException('El cierre debe estar validado antes de generar la liquidación');
    }

    const existing = await this.settlementsRepo.findByClosure(dto.closureId);
    if (existing) {
      throw new ConflictException('Ya existe una liquidación para este cierre');
    }

    const amountDue = await this.calculateAmountDue(closure);
    const amountCollected = Number(closure.totalCollected);
    const outstandingDebt = amountDue - amountCollected;

    return this.settlementsRepo.create({
      closureId: closure.closureId,
      staffId: closure.staffId,
      societyId: closure.societyId,
      settlementDate: closure.closingDate,
      amountDue,
      amountCollected,
      outstandingDebt,
      status: SettlementStatus.PENDING,
    });
  }

  private async calculateAmountDue(closure: DailyClosure): Promise<number> {
    const routeSheets = await this.routeSheetRepo.find({
      where: { staffId: closure.staffId, routeDate: closure.closingDate },
    });
    const routeSheetIds = routeSheets.map(rs => rs.routeSheetId);
    if (!routeSheetIds.length) return 0;

    const items = await this.routeSheetItemRepo.find({
      where: { routeSheetId: In(routeSheetIds), itemType: RouteSheetItemType.INSTALLMENT },
    });
    const installmentIds = items.map(i => i.installmentId).filter(Boolean);
    if (!installmentIds.length) return 0;

    const installments = await this.installmentRepo.find({ where: { installmentId: In(installmentIds) } });
    return installments.reduce((sum, inst) => sum + Number(inst.amount), 0);
  }

  async validate(id: string, dto: ValidateSettlementDto): Promise<void> {
    const settlement = await this.findById(id);
    if (settlement.status !== SettlementStatus.PENDING) {
      throw new BadRequestException('La liquidación ya fue validada');
    }

    const status = dto.status === 'validated' ? SettlementStatus.VALIDATED : SettlementStatus.REJECTED;
    await this.settlementsRepo.updateStatus(id, status);
  }
}
