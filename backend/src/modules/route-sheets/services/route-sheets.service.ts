import {
  Injectable, Inject, NotFoundException,
  BadRequestException, ConflictException, ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, LessThanOrEqual, Repository } from 'typeorm';
import {
  IRouteSheetsRepository, ROUTE_SHEETS_REPOSITORY, RouteSheetFilters,
} from '../interfaces/route-sheets-repository.interface';
import {
  IRouteSheetItemsRepository, ROUTE_SHEET_ITEMS_REPOSITORY,
} from '../interfaces/route-sheet-items-repository.interface';
import { CreateRouteSheetDto } from '../dto/create-route-sheet.dto';
import { RouteSheet } from '../entities/route-sheet.entity';
import { RouteSheetItem } from '../entities/route-sheet-item.entity';
import { RouteSheetStatus } from '../../../common/enums/route-sheet-status.enum';
import { RouteSheetItemType } from '../../../common/enums/route-sheet-item-type.enum';
import { InstallmentStatus } from '../../../common/enums/installment-status.enum';
import { SaleStatus } from '../../../common/enums/sale-status.enum';
import { StaffRole } from '../../../common/enums/staff-role.enum';
import { Zone } from '../../zones/entities/zone.entity';
import { StaffZone, StaffZoneStatus } from '../../zones/entities/staff-zone.entity';
import { Staff } from '../../staff/entities/staff.entity';
import { Client } from '../../clients/entities/client.entity';
import { Installment } from '../../installments/entities/installment.entity';
import { Sale } from '../../sales/entities/sale.entity';
import { JwtPayload } from '../../auth/interfaces/jwt-payload.interface';

const OPEN_INSTALLMENT_STATUSES = [
  InstallmentStatus.PENDING,
  InstallmentStatus.OVERDUE,
  InstallmentStatus.PARTIAL,
];

const ALLOWED_TRANSITIONS: Record<RouteSheetStatus, RouteSheetStatus[]> = {
  [RouteSheetStatus.PENDING]: [RouteSheetStatus.IN_PROGRESS, RouteSheetStatus.CANCELLED],
  [RouteSheetStatus.IN_PROGRESS]: [RouteSheetStatus.COMPLETED, RouteSheetStatus.CANCELLED],
  [RouteSheetStatus.COMPLETED]: [],
  [RouteSheetStatus.CANCELLED]: [],
};

@Injectable()
export class RouteSheetsService {
  constructor(
    @Inject(ROUTE_SHEETS_REPOSITORY)
    private readonly routeSheetsRepo: IRouteSheetsRepository,
    @Inject(ROUTE_SHEET_ITEMS_REPOSITORY)
    private readonly itemsRepo: IRouteSheetItemsRepository,
    @InjectRepository(Zone) private readonly zoneRepo: Repository<Zone>,
    @InjectRepository(StaffZone) private readonly staffZoneRepo: Repository<StaffZone>,
    @InjectRepository(Staff) private readonly staffRepo: Repository<Staff>,
    @InjectRepository(Client) private readonly clientRepo: Repository<Client>,
    @InjectRepository(Installment) private readonly installmentRepo: Repository<Installment>,
    @InjectRepository(Sale) private readonly saleRepo: Repository<Sale>,
  ) {}

  // ─── QUERIES ──────────────────────────────────────────────────────────────

  findBySociety(societyId: string, filters?: RouteSheetFilters): Promise<RouteSheet[]> {
    return this.routeSheetsRepo.findBySociety(societyId, filters);
  }

  findByStaff(staffId: string, societyId: string, filters?: RouteSheetFilters): Promise<RouteSheet[]> {
    return this.routeSheetsRepo.findByStaff(staffId, societyId, filters);
  }

  async findById(id: string): Promise<RouteSheet> {
    const routeSheet = await this.routeSheetsRepo.findById(id);
    if (!routeSheet) throw new NotFoundException(`Hoja de ruta ${id} no encontrada`);
    return routeSheet;
  }

  async findByIdWithItems(id: string): Promise<RouteSheet & { items: RouteSheetItem[] }> {
    const routeSheet = await this.findById(id);
    const items = await this.itemsRepo.findByRouteSheet(id);
    return { ...routeSheet, items };
  }

  // ─── CREAR HOJA DE RUTA ───────────────────────────────────────────────────

  async create(dto: CreateRouteSheetDto, user: JwtPayload): Promise<RouteSheet & { items: RouteSheetItem[] }> {
    const societyId = user.societyId;

    const zone = await this.zoneRepo.findOne({ where: { zoneId: dto.zoneId } });
    if (!zone || zone.societyId !== societyId) {
      throw new NotFoundException(`Zona ${dto.zoneId} no encontrada`);
    }

    const staff = await this.staffRepo.findOne({ where: { staffId: dto.staffId } });
    if (!staff) throw new NotFoundException(`Empleado ${dto.staffId} no encontrado`);
    if (staff.role !== StaffRole.COLLECTOR) {
      throw new BadRequestException('Solo se pueden asignar hojas de ruta a cobradores');
    }

    const staffZone = await this.staffZoneRepo.findOne({
      where: { staffId: dto.staffId, zoneId: dto.zoneId, status: StaffZoneStatus.ACTIVE },
    });
    if (!staffZone) {
      throw new BadRequestException('El cobrador no está asignado a esta zona');
    }

    const existing = await this.routeSheetsRepo.findActiveForStaffZoneDate(dto.staffId, dto.zoneId, dto.routeDate);
    if (existing) {
      throw new ConflictException('Ya existe una hoja de ruta activa para este cobrador, zona y fecha');
    }

    const routeSheet = await this.routeSheetsRepo.create({
      societyId,
      zoneId: dto.zoneId,
      staffId: dto.staffId,
      assignedBy: user.sub,
      routeDate: new Date(dto.routeDate),
      status: RouteSheetStatus.PENDING,
    });

    const items = await this.generateItems(routeSheet, dto.routeDate);

    return { ...routeSheet, items };
  }

  private async generateItems(routeSheet: RouteSheet, routeDate: string): Promise<RouteSheetItem[]> {
    const clients = await this.clientRepo.find({ where: { zoneId: routeSheet.zoneId } });
    const clientIds = clients.map(c => c.clientId);
    if (!clientIds.length) return [];

    const pendingInstallments = await this.installmentRepo.find({
      where: {
        clientId: In(clientIds),
        status: In(OPEN_INSTALLMENT_STATUSES),
        dueDate: LessThanOrEqual(routeDate as unknown as Date),
      },
    });

    const pendingDeliveries = await this.saleRepo
      .createQueryBuilder('sale')
      .where('sale.client_id IN (:...clientIds)', { clientIds })
      .andWhere('sale.status = :status', { status: SaleStatus.PENDING_DELIVERY })
      .andWhere('(sale.assigned_collector_id IS NULL OR sale.assigned_collector_id = :staffId)', {
        staffId: routeSheet.staffId,
      })
      .getMany();

    const itemsToCreate: Partial<RouteSheetItem>[] = [
      ...pendingInstallments.map(inst => ({
        routeSheetId: routeSheet.routeSheetId,
        clientId: inst.clientId,
        installmentId: inst.installmentId,
        itemType: RouteSheetItemType.INSTALLMENT,
      })),
      ...pendingDeliveries.map(sale => ({
        routeSheetId: routeSheet.routeSheetId,
        clientId: sale.clientId,
        saleId: sale.saleId,
        itemType: RouteSheetItemType.DELIVERY,
      })),
    ];

    return this.itemsRepo.createMany(itemsToCreate);
  }

  // ─── ACTUALIZAR ESTADO ────────────────────────────────────────────────────

  async updateStatus(id: string, status: RouteSheetStatus, user: JwtPayload): Promise<void> {
    const routeSheet = await this.findById(id);

    if (user.role === StaffRole.COLLECTOR && routeSheet.staffId !== user.sub) {
      throw new ForbiddenException('No eres el cobrador asignado a esta hoja de ruta');
    }

    if (!ALLOWED_TRANSITIONS[routeSheet.status].includes(status)) {
      throw new BadRequestException(
        `No se puede pasar de ${routeSheet.status} a ${status}`,
      );
    }

    await this.routeSheetsRepo.updateStatus(id, status);
  }
}
