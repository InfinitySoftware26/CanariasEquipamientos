import { Injectable, Inject, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IClosuresRepository, CLOSURES_REPOSITORY, ClosureFilters } from '../interfaces/closures-repository.interface';
import { CreateClosureDto } from '../dto/create-closure.dto';
import { ValidateClosureDto } from '../dto/validate-closure.dto';
import { DailyClosure } from '../entities/daily-closure.entity';
import { DailyClosureStatus } from '../../../common/enums/daily-closure-status.enum';
import { RouteSheetItemType } from '../../../common/enums/route-sheet-item-type.enum';
import { RouteSheetItemResult } from '../../../common/enums/route-sheet-item-result.enum';
import { RouteSheet } from '../../route-sheets/entities/route-sheet.entity';
import { RouteSheetItem } from '../../route-sheets/entities/route-sheet-item.entity';
import { JwtPayload } from '../../auth/interfaces/jwt-payload.interface';

@Injectable()
export class ClosuresService {
  constructor(
    @Inject(CLOSURES_REPOSITORY)
    private readonly closuresRepo: IClosuresRepository,
    @InjectRepository(RouteSheet) private readonly routeSheetRepo: Repository<RouteSheet>,
    @InjectRepository(RouteSheetItem) private readonly routeSheetItemRepo: Repository<RouteSheetItem>,
  ) {}

  findBySociety(societyId: string, filters?: ClosureFilters): Promise<DailyClosure[]> {
    return this.closuresRepo.findBySociety(societyId, filters);
  }

  findByStaff(staffId: string, societyId: string, filters?: ClosureFilters): Promise<DailyClosure[]> {
    return this.closuresRepo.findByStaff(staffId, societyId, filters);
  }

  async findById(id: string): Promise<DailyClosure> {
    const closure = await this.closuresRepo.findById(id);
    if (!closure) throw new NotFoundException(`Cierre ${id} no encontrado`);
    return closure;
  }

  async create(dto: CreateClosureDto, user: JwtPayload): Promise<DailyClosure> {
    const existing = await this.closuresRepo.findByStaffAndDate(user.sub, dto.closingDate);
    if (existing) {
      throw new ConflictException('Ya existe un cierre para este cobrador en esta fecha');
    }

    return this.closuresRepo.create({
      staffId: user.sub,
      societyId: user.societyId,
      closingDate: new Date(dto.closingDate),
      totalCollected: dto.totalCollected,
      notes: dto.notes,
      status: DailyClosureStatus.PENDING,
    });
  }

  async getReconciliation(id: string): Promise<{ declared: number; systemCalculated: number; difference: number }> {
    const closure = await this.findById(id);

    const routeSheets = await this.routeSheetRepo.find({
      where: {
        staffId: closure.staffId,
        routeDate: closure.closingDate,
      },
    });
    const routeSheetIds = routeSheets.map(rs => rs.routeSheetId);

    let systemCalculated = 0;
    if (routeSheetIds.length) {
      const items = await this.routeSheetItemRepo
        .createQueryBuilder('item')
        .where('item.route_sheet_id IN (:...routeSheetIds)', { routeSheetIds })
        .andWhere('item.item_type = :type', { type: RouteSheetItemType.INSTALLMENT })
        .andWhere('item.result = :result', { result: RouteSheetItemResult.COMPLETED })
        .getMany();
      systemCalculated = items.reduce((sum, i) => sum + Number(i.collectedAmount ?? 0), 0);
    }

    const declared = Number(closure.totalCollected);
    return { declared, systemCalculated, difference: declared - systemCalculated };
  }

  async validate(id: string, dto: ValidateClosureDto, user: JwtPayload): Promise<void> {
    const closure = await this.findById(id);
    if (closure.status !== DailyClosureStatus.PENDING) {
      throw new BadRequestException('El cierre ya fue validado');
    }

    const status = dto.status === 'validated' ? DailyClosureStatus.VALIDATED : DailyClosureStatus.REJECTED;
    await this.closuresRepo.updateStatus(id, status, user.sub);
  }
}
