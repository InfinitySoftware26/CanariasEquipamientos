import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, LessThanOrEqual, Repository } from "typeorm";
import {
  IRouteSheetsRepository,
  ROUTE_SHEETS_REPOSITORY,
  RouteSheetFilters,
} from "../interfaces/route-sheets-repository.interface";
import {
  IRouteSheetItemsRepository,
  ROUTE_SHEET_ITEMS_REPOSITORY,
} from "../interfaces/route-sheet-items-repository.interface";
import { CreateRouteSheetDto } from "../dto/create-route-sheet.dto";
import { RouteSheet } from "../entities/route-sheet.entity";
import { RouteSheetItem } from "../entities/route-sheet-item.entity";
import { RouteSheetStatus } from "../../../common/enums/route-sheet-status.enum";
import { RouteSheetItemType } from "../../../common/enums/route-sheet-item-type.enum";
import { RouteSheetItemResult } from "../../../common/enums/route-sheet-item-result.enum";
import { InstallmentStatus } from "../../../common/enums/installment-status.enum";
import { SaleStatus } from "../../../common/enums/sale-status.enum";
import { StaffRole } from "../../../common/enums/staff-role.enum";
import { Zone } from "../../zones/entities/zone.entity";
import {
  StaffZone,
  StaffZoneStatus,
} from "../../zones/entities/staff-zone.entity";
import { Staff } from "../../staff/entities/staff.entity";
import { Client } from "../../clients/entities/client.entity";
import { Installment } from "../../installments/entities/installment.entity";
import { Sale } from "../../sales/entities/sale.entity";
import { JwtPayload } from "../../auth/interfaces/jwt-payload.interface";

const OPEN_INSTALLMENT_STATUSES = [
  InstallmentStatus.PENDING,
  InstallmentStatus.OVERDUE,
  InstallmentStatus.PARTIAL,
];

const ALLOWED_TRANSITIONS: Record<RouteSheetStatus, RouteSheetStatus[]> = {
  [RouteSheetStatus.PENDING]: [
    RouteSheetStatus.IN_PROGRESS,
    RouteSheetStatus.CANCELLED,
  ],
  [RouteSheetStatus.IN_PROGRESS]: [
    RouteSheetStatus.COMPLETED,
    RouteSheetStatus.CANCELLED,
  ],
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
    @InjectRepository(StaffZone)
    private readonly staffZoneRepo: Repository<StaffZone>,
    @InjectRepository(Staff) private readonly staffRepo: Repository<Staff>,
    @InjectRepository(Client) private readonly clientRepo: Repository<Client>,
    @InjectRepository(Installment)
    private readonly installmentRepo: Repository<Installment>,
    @InjectRepository(Sale) private readonly saleRepo: Repository<Sale>,
  ) {}

  // ─── QUERIES ──────────────────────────────────────────────────────────────

  private toResponse(routeSheet: RouteSheet) {
    const { zone, staff, ...rest } = routeSheet;
    return {
      ...rest,
      zoneName: zone?.name ?? null,
      staffName: staff?.name ?? null,
    };
  }

  async findBySociety(societyId: string, filters?: RouteSheetFilters) {
    const routeSheets = await this.routeSheetsRepo.findBySociety(
      societyId,
      filters,
    );
    return routeSheets.map((rs) => this.toResponse(rs));
  }

  async findByStaff(
    staffId: string,
    societyId: string,
    filters?: RouteSheetFilters,
  ) {
    const routeSheets = await this.routeSheetsRepo.findByStaff(
      staffId,
      societyId,
      filters,
    );
    return routeSheets.map((rs) => this.toResponse(rs));
  }

  async findById(id: string): Promise<RouteSheet> {
    const routeSheet = await this.routeSheetsRepo.findById(id);
    if (!routeSheet)
      throw new NotFoundException(`Hoja de ruta ${id} no encontrada`);
    return routeSheet;
  }

  async findByIdWithItems(id: string) {
    const routeSheet = await this.findById(id);

    const items = await this.itemsRepo.findByRouteSheet(id);

    const enrichedItems = await Promise.all(
      items.map(async (item) => {
        const client = await this.clientRepo.findOne({
          where: {
            clientId: item.clientId,
          },
        });

        const installment = item.installmentId
          ? await this.installmentRepo.findOne({
              where: {
                installmentId: item.installmentId,
              },
            })
          : null;

        const sale = item.saleId
          ? await this.saleRepo.findOne({
              where: {
                saleId: item.saleId,
              },
            })
          : null;

        return {
          ...item,

          clientName: client
            ? `${client.name ?? ""} ${client.surname ?? ""}`.trim()
            : null,

          clientAddress: client?.address ?? null,

          installmentAmount: installment?.amount ?? null,

          installmentDueDate: installment?.dueDate ?? null,

          saleId: sale?.saleId ?? item.saleId ?? null,
        };
      }),
    );

    return {
      ...this.toResponse(routeSheet),
      items: enrichedItems,
    };
  }
  // ─── CREAR HOJA DE RUTA ───────────────────────────────────────────────────

  async create(dto: CreateRouteSheetDto, user: JwtPayload) {
    const societyId = user.societyId;
    const zone = await this.zoneRepo.findOne({ where: { zoneId: dto.zoneId } });
    if (!zone || zone.societyId !== societyId) {
      throw new NotFoundException(`Zona ${dto.zoneId} no encontrada`);
    }

    const staff = await this.staffRepo.findOne({
      where: { staffId: dto.staffId },
    });
    if (!staff)
      throw new NotFoundException(`Empleado ${dto.staffId} no encontrado`);
    if (staff.role !== StaffRole.COLLECTOR) {
      throw new BadRequestException(
        "Solo se pueden asignar hojas de ruta a cobradores",
      );
    }

    const staffZone = await this.staffZoneRepo.findOne({
      where: {
        staffId: dto.staffId,
        zoneId: dto.zoneId,
        status: StaffZoneStatus.ACTIVE,
      },
    });
    if (!staffZone) {
      throw new BadRequestException("El cobrador no está asignado a esta zona");
    }

    const existing = await this.routeSheetsRepo.findActiveForStaffZoneDate(
      dto.staffId,
      dto.zoneId,
      dto.routeDate,
    );
    if (existing) {
      throw new ConflictException(
        "Ya existe una hoja de ruta activa para este cobrador, zona y fecha",
      );
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

    return { ...routeSheet, zoneName: zone.name, staffName: staff.name, items };
  }

  private async generateItems(
    routeSheet: RouteSheet,
    routeDate: string,
  ): Promise<RouteSheetItem[]> {
    const pendingInstallments = await this.installmentRepo
      .createQueryBuilder("installment")
      .innerJoin(Sale, "sale", "sale.sale_id = installment.sale_id")
      .innerJoin(Client, "client", "client.client_id = installment.client_id")
      .where("installment.status IN (:...statuses)", {
        statuses: OPEN_INSTALLMENT_STATUSES,
      })
      .andWhere("installment.due_date <= :routeDate", {
        routeDate,
      })
      .andWhere("client.zone_id = :zoneId", {
        zoneId: routeSheet.zoneId,
      })
      .andWhere("installment.society_id = :societyId", {
        societyId: routeSheet.societyId,
      })
      .andWhere("sale.assigned_collector_id = :staffId", {
        staffId: routeSheet.staffId,
      })
      .getMany();

    const pendingDeliveries = await this.saleRepo
      .createQueryBuilder("sale")
      .where(
        "sale.client_id IN (SELECT client_id FROM CLIENT WHERE zone_id = :zoneId)",
        {
          zoneId: routeSheet.zoneId,
        },
      )
      .andWhere("sale.society_id = :societyId", {
        societyId: routeSheet.societyId,
      })
      .andWhere("sale.status = :status", {
        status: SaleStatus.PENDING_DELIVERY,
      })
      .andWhere(
        "(sale.assigned_collector_id IS NULL OR sale.assigned_collector_id = :staffId)",
        {
          staffId: routeSheet.staffId,
        },
      )
      .getMany();

    const itemsToCreate: Partial<RouteSheetItem>[] = [
      ...pendingInstallments.map((inst) => ({
        routeSheetId: routeSheet.routeSheetId,
        clientId: inst.clientId,
        installmentId: inst.installmentId,
        saleId: inst.saleId,
        itemType: RouteSheetItemType.INSTALLMENT,
      })),

      ...pendingDeliveries.map((sale) => ({
        routeSheetId: routeSheet.routeSheetId,
        clientId: sale.clientId,
        saleId: sale.saleId,
        itemType: RouteSheetItemType.DELIVERY,
      })),
    ];

    return this.itemsRepo.createMany(itemsToCreate);
  }

  // ─── ACTUALIZAR ESTADO ────────────────────────────────────────────────────

  async updateStatus(
    id: string,
    status: RouteSheetStatus,
    user: JwtPayload,
  ): Promise<void> {
    const routeSheet = await this.findById(id);

    if (user.role === StaffRole.COLLECTOR && routeSheet.staffId !== user.sub) {
      throw new ForbiddenException(
        "No eres el cobrador asignado a esta hoja de ruta",
      );
    }

    const allowedTransitions = ALLOWED_TRANSITIONS[routeSheet.status] ?? [];

    if (!allowedTransitions.includes(status)) {
      throw new BadRequestException(
        `No se puede pasar de ${routeSheet.status} a ${status}`,
      );
    }

    if (status === RouteSheetStatus.COMPLETED) {
      const items = await this.itemsRepo.findByRouteSheet(id);
      const hasPendingItems = items.some(
        (item) => item.result === RouteSheetItemResult.PENDING,
      );

      if (hasPendingItems) {
        throw new BadRequestException(
          "No se puede completar la hoja de ruta mientras existan visitas pendientes",
        );
      }
    }

    await this.routeSheetsRepo.updateStatus(id, status);
  }
}
