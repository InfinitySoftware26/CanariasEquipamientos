import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { InjectRepository } from "@nestjs/typeorm";

import { In, Repository } from "typeorm";

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

import { CollectionScheduleType } from "../../../common/enums/collection-schedule-type.enum";

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

// ============================================================
// ESTADOS DE CUOTA COBRABLES
// ============================================================

const OPEN_INSTALLMENT_STATUSES = [
  InstallmentStatus.PENDING,
  InstallmentStatus.OVERDUE,
  InstallmentStatus.PARTIAL,
];

// ============================================================
// TRANSICIONES DE HOJA
// ============================================================

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

// ============================================================
// CANDIDATO INTERNO
// ============================================================

interface RouteCandidate {
  installment: Installment;

  sale: Sale;

  client: Client;

  lateInterestAmount: number;

  daysLate: number;

  totalToCollect: number;
}

@Injectable()
export class RouteSheetsService {
  constructor(
    @Inject(ROUTE_SHEETS_REPOSITORY)
    private readonly routeSheetsRepo: IRouteSheetsRepository,

    @Inject(ROUTE_SHEET_ITEMS_REPOSITORY)
    private readonly itemsRepo: IRouteSheetItemsRepository,

    @InjectRepository(Zone)
    private readonly zoneRepo: Repository<Zone>,

    @InjectRepository(StaffZone)
    private readonly staffZoneRepo: Repository<StaffZone>,

    @InjectRepository(Staff)
    private readonly staffRepo: Repository<Staff>,

    @InjectRepository(Client)
    private readonly clientRepo: Repository<Client>,

    @InjectRepository(Installment)
    private readonly installmentRepo: Repository<Installment>,

    @InjectRepository(Sale)
    private readonly saleRepo: Repository<Sale>,
  ) {}

  // ============================================================
  // LISTADOS
  // ============================================================

  findBySociety(
    societyId: string,
    filters?: RouteSheetFilters,
  ): Promise<RouteSheet[]> {
    return this.routeSheetsRepo.findBySociety(societyId, filters);
  }

  findByStaff(
    staffId: string,
    societyId: string,
    filters?: RouteSheetFilters,
  ): Promise<RouteSheet[]> {
    return this.routeSheetsRepo.findByStaff(staffId, societyId, filters);
  }

  // ============================================================
  // BUSCAR HOJA
  // ============================================================

  async findById(id: string): Promise<RouteSheet> {
    const routeSheet = await this.routeSheetsRepo.findById(id);

    if (!routeSheet) {
      throw new NotFoundException(`Hoja de ruta ${id} no encontrada`);
    }

    return routeSheet;
  }

  // ============================================================
  // DETALLE COMPLETO
  // ============================================================

  async findByIdWithItems(id: string, user: JwtPayload) {
    const routeSheet = await this.findById(id);

    if (routeSheet.societyId !== user.societyId) {
      throw new ForbiddenException(
        "La hoja de ruta no pertenece a esta sociedad",
      );
    }

    if (user.role === StaffRole.COLLECTOR && routeSheet.staffId !== user.sub) {
      throw new ForbiddenException(
        "No eres el cobrador asignado a esta hoja de ruta",
      );
    }

    const [items, zone, staff] = await Promise.all([
      this.itemsRepo.findByRouteSheet(id),

      this.zoneRepo.findOne({
        where: {
          zoneId: routeSheet.zoneId,
        },
      }),

      this.staffRepo.findOne({
        where: {
          staffId: routeSheet.staffId,
        },
      }),
    ]);

    const enrichedItems = await Promise.all(
      items.map(async (item) => {
        const client = await this.clientRepo.findOne({
          where: {
            clientId: item.clientId,
          },
        });

        let installment: Installment | null = null;

        if (item.installmentId) {
          installment = await this.installmentRepo.findOne({
            where: {
              installmentId: item.installmentId,
            },
          });
        }

        const remainingAmount = Number(installment?.remainingAmount ?? 0);

        const lateInterestAmount = Number(installment?.lateInterestAmount ?? 0);

        const daysLate = installment
          ? this.calculateDaysLate(installment.dueDate, routeSheet.routeDate)
          : 0;

        const clientPhone =
          (
            client as
              | (Client & {
                  phone?: string | null;
                })
              | null
          )?.phone ?? null;

        return {
          ...item,

          clientName: client?.name ?? null,

          clientDocumentNumber: client?.documentNumber ?? null,

          clientAddress: client?.address ?? null,

          clientPhone,

          installmentNumber: installment?.installmentNumber ?? null,

          installmentAmount: installment ? Number(installment.amount) : null,

          installmentRemainingAmount: installment ? remainingAmount : null,

          installmentDueDate: installment?.dueDate ?? null,

          lateInterestAmount: installment ? lateInterestAmount : null,

          daysLate,

          totalToCollect: installment
            ? this.roundMoney(remainingAmount + lateInterestAmount)
            : null,

          collectionState: installment
            ? this.getCollectionState(installment, routeSheet.routeDate)
            : null,
        };
      }),
    );

    const staffName =
      (
        staff as
          | (Staff & {
              name?: string;
            })
          | null
      )?.name ?? null;

    return {
      ...routeSheet,

      zoneName: zone?.name ?? null,

      staffName,

      items: enrichedItems,
    };
  }

  // ============================================================
  // CREAR HOJA EXTRAORDINARIA
  // ============================================================

  async create(dto: CreateRouteSheetDto, user: JwtPayload) {
    await this.validateZoneAndCollector(
      user.societyId,
      dto.zoneId,
      dto.staffId,
    );

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

    /**
     * Esta ruta representa una hoja EXTRAORDINARIA.
     *
     * No agregamos automáticamente cuotas.
     * Administración podrá incorporarlas mediante:
     *
     * POST /route-sheets/:id/installments
     */
    const routeSheet = await this.routeSheetsRepo.create({
      societyId: user.societyId,

      zoneId: dto.zoneId,

      staffId: dto.staffId,

      assignedBy: user.sub,

      routeDate: this.parseDate(dto.routeDate),

      status: RouteSheetStatus.PENDING,

      notes: dto.notes?.trim() || "Hoja extraordinaria",
    });

    return this.findByIdWithItems(routeSheet.routeSheetId, user);
  }

  // ============================================================
  // GENERACIÓN NORMAL DEL DÍA
  // ============================================================

  async generateDaily(routeDate: string, user: JwtPayload) {
    return this.generateDailyForSociety(user.societyId, routeDate, user.sub);
  }

  // ============================================================
  // MOTOR DE GENERACIÓN
  // ============================================================

  async generateDailyForSociety(
    societyId: string,
    routeDate: string,
    assignedBy?: string,
  ) {
    const candidates = await this.getRouteCandidates(societyId, routeDate);

    const groups = new Map<
      string,
      {
        zoneId: string;

        staffId: string;

        candidates: RouteCandidate[];
      }
    >();

    for (const candidate of candidates) {
      const staffId = candidate.sale.assignedCollectorId;

      const zoneId = candidate.client.zoneId;

      if (!staffId || !zoneId) {
        continue;
      }

      const key = `${zoneId}:${staffId}`;

      const existingGroup = groups.get(key);

      if (existingGroup) {
        existingGroup.candidates.push(candidate);

        continue;
      }

      groups.set(key, {
        zoneId,

        staffId,

        candidates: [candidate],
      });
    }

    const routeSheets: RouteSheet[] = [];

    const skippedGroups: Array<{
      zoneId: string;

      staffId: string;

      reason: string;
    }> = [];

    for (const group of groups.values()) {
      try {
        await this.validateZoneAndCollector(
          societyId,
          group.zoneId,
          group.staffId,
        );

        const existing = await this.routeSheetsRepo.findActiveForStaffZoneDate(
          group.staffId,
          group.zoneId,
          routeDate,
        );

        /**
         * Idempotencia.
         *
         * Si el cron corre nuevamente,
         * no crea otra hoja igual.
         */
        if (existing) {
          skippedGroups.push({
            zoneId: group.zoneId,

            staffId: group.staffId,

            reason: "Ya existe una hoja activa para esa zona, cobrador y fecha",
          });

          continue;
        }

        const routeSheet = await this.routeSheetsRepo.create({
          societyId,

          zoneId: group.zoneId,

          staffId: group.staffId,

          /**
           * Manual:
           * UUID del admin.
           *
           * Automática:
           * null.
           */
          assignedBy: assignedBy ?? null,

          routeDate: this.parseDate(routeDate),

          status: RouteSheetStatus.PENDING,

          notes: assignedBy
            ? "Hoja generada manualmente desde la programación de cobranzas"
            : "Hoja generada automáticamente por el sistema",
        });

        await this.generateInstallmentItems(routeSheet, group.candidates);

        await this.generatePendingDeliveryItems(routeSheet);

        routeSheets.push(routeSheet);
      } catch (error) {
        skippedGroups.push({
          zoneId: group.zoneId,

          staffId: group.staffId,

          reason:
            error instanceof Error ? error.message : "Error generando hoja",
        });
      }
    }

    return {
      routeDate,

      created: routeSheets.length,

      skipped: skippedGroups.length,

      routeSheets,

      skippedGroups,
    };
  }
  // ============================================================
  // SELECCIÓN AUTOMÁTICA DE CUOTAS
  // ============================================================

  private async getRouteCandidates(
    societyId: string,
    routeDate: string,
    zoneId?: string,
    staffId?: string,
  ): Promise<RouteCandidate[]> {
    const query = this.installmentRepo
      .createQueryBuilder("installment")

      .innerJoin(Sale, "sale", "sale.sale_id = installment.sale_id")

      .innerJoin(Client, "client", "client.client_id = installment.client_id")

      .where("installment.society_id = :societyId", {
        societyId,
      })

      .andWhere("installment.status IN (:...statuses)", {
        statuses: OPEN_INSTALLMENT_STATUSES,
      })

      .andWhere("installment.is_refinanced = false")

      .andWhere("installment.remaining_amount > 0")

      /**
       * No cobramos antes del vencimiento.
       *
       * Una cuota vencida continúa siendo candidata
       * en la siguiente visita programada.
       */
      .andWhere("installment.due_date <= :routeDate", {
        routeDate,
      })

      .andWhere("sale.assigned_collector_id IS NOT NULL");

    if (zoneId) {
      query.andWhere("client.zone_id = :zoneId", {
        zoneId,
      });
    }

    if (staffId) {
      query.andWhere("sale.assigned_collector_id = :staffId", {
        staffId,
      });
    }

    const installments = await query
      .orderBy("installment.due_date", "ASC")

      .addOrderBy("installment.installment_number", "ASC")

      .getMany();

    if (installments.length === 0) {
      return [];
    }

    const saleIds = [
      ...new Set(installments.map((installment) => installment.saleId)),
    ];

    const clientIds = [
      ...new Set(installments.map((installment) => installment.clientId)),
    ];

    const [sales, clients] = await Promise.all([
      this.saleRepo.find({
        where: {
          saleId: In(saleIds),
        },
      }),

      this.clientRepo.find({
        where: {
          clientId: In(clientIds),
        },
      }),
    ]);

    const salesById = new Map(sales.map((sale) => [sale.saleId, sale]));

    const clientsById = new Map(
      clients.map((client) => [client.clientId, client]),
    );

    const selectedSales = new Set<string>();

    const candidates: RouteCandidate[] = [];

    for (const installment of installments) {
      const sale = salesById.get(installment.saleId);

      const client = clientsById.get(installment.clientId);

      if (!sale || !client) {
        continue;
      }

      // ======================================================
      // CUOTA 1 = ENTREGA
      // ======================================================

      const minimumInstallmentNumber = sale.firstInstallmentOnDelivery ? 2 : 1;

      if (Number(installment.installmentNumber) < minimumInstallmentNumber) {
        continue;
      }

      // ======================================================
      // DÍA DE COBRANZA
      // ======================================================

      if (!this.saleMatchesRouteDate(sale, routeDate)) {
        continue;
      }

      // ======================================================
      // UNA CUOTA POR VENTA
      // ======================================================

      if (selectedSales.has(sale.saleId)) {
        continue;
      }

      // ======================================================
      // NO DUPLICAR EN OTRA HOJA ACTIVA
      // ======================================================

      const activeItem = await this.itemsRepo.findActiveByInstallment(
        installment.installmentId,
      );

      if (activeItem) {
        continue;
      }

      // ======================================================
      // MORA
      // ======================================================

      const lateInfo = await this.refreshLateInterest(installment, routeDate);

      selectedSales.add(sale.saleId);

      candidates.push({
        installment,

        sale,

        client,

        lateInterestAmount: lateInfo.lateInterestAmount,

        daysLate: lateInfo.daysLate,

        totalToCollect: lateInfo.totalToCollect,
      });
    }

    return candidates;
  }

  // ============================================================
  // VALIDAR FECHA SEGÚN PROGRAMACIÓN
  // ============================================================

  private saleMatchesRouteDate(sale: Sale, routeDate: string): boolean {
    const date = this.parseDate(routeDate);

    // ======================================================
    // FECHA MANUAL COORDINADA
    // ======================================================

    if (sale.manualCollectionDate) {
      const manualDate = this.formatDate(sale.manualCollectionDate);

      if (manualDate === routeDate) {
        return true;
      }
    }

    /**
     * Una venta sin programación no debe entrar
     * automáticamente.
     *
     * Si necesita cobrarse, Administración puede
     * agregarla manualmente.
     */
    if (!sale.collectionScheduleType) {
      return false;
    }

    // ======================================================
    // DÍA FIJO SEMANAL
    // ======================================================

    if (sale.collectionScheduleType === CollectionScheduleType.FIXED_WEEKDAY) {
      if (
        sale.collectionWeekday === null ||
        sale.collectionWeekday === undefined
      ) {
        return false;
      }

      return date.getDay() === Number(sale.collectionWeekday);
    }

    // ======================================================
    // RANGO MENSUAL
    // ======================================================

    if (sale.collectionScheduleType === CollectionScheduleType.MONTHLY_RANGE) {
      const startDay = sale.paymentRangeStartDay;

      const endDay = sale.paymentRangeEndDay;

      if (
        startDay === null ||
        startDay === undefined ||
        endDay === null ||
        endDay === undefined
      ) {
        return false;
      }

      /**
       * Para rango mensual necesitamos que Administración
       * haya coordinado el día concreto.
       *
       * Esto evita meter al cliente todos los días,
       * por ejemplo, del 1 al 10.
       */
      if (!sale.manualCollectionDate) {
        return false;
      }

      const manualDate = this.formatDate(sale.manualCollectionDate);

      if (manualDate !== routeDate) {
        return false;
      }

      const day = date.getDate();

      return day >= Number(startDay) && day <= Number(endDay);
    }

    return false;
  }

  // ============================================================
  // ITEMS AUTOMÁTICOS DE CUOTA
  // ============================================================

  private async generateInstallmentItems(
    routeSheet: RouteSheet,
    candidates: RouteCandidate[],
  ) {
    const items: Partial<RouteSheetItem>[] = candidates.map((candidate) => ({
      routeSheetId: routeSheet.routeSheetId,

      clientId: candidate.client.clientId,

      saleId: candidate.sale.saleId,

      installmentId: candidate.installment.installmentId,

      itemType: RouteSheetItemType.INSTALLMENT,

      result: RouteSheetItemResult.PENDING,
    }));

    return this.itemsRepo.createMany(items);
  }

  // ============================================================
  // ENTREGAS PENDIENTES
  // ============================================================

  private async generatePendingDeliveryItems(routeSheet: RouteSheet) {
    const pendingDeliveries = await this.saleRepo
      .createQueryBuilder("sale")

      .innerJoin(Client, "client", "client.client_id = sale.client_id")

      .where("sale.society_id = :societyId", {
        societyId: routeSheet.societyId,
      })

      .andWhere("client.zone_id = :zoneId", {
        zoneId: routeSheet.zoneId,
      })

      .andWhere("sale.status = :status", {
        status: SaleStatus.PENDING_DELIVERY,
      })

      .andWhere("sale.assigned_collector_id = :staffId", {
        staffId: routeSheet.staffId,
      })

      .getMany();

    const items: Partial<RouteSheetItem>[] = [];

    for (const sale of pendingDeliveries) {
      const existing = await this.itemsRepo.findActiveDeliveryBySale(
        sale.saleId,
      );

      if (existing) {
        continue;
      }

      items.push({
        routeSheetId: routeSheet.routeSheetId,

        clientId: sale.clientId,

        saleId: sale.saleId,

        itemType: RouteSheetItemType.DELIVERY,

        result: RouteSheetItemResult.PENDING,
      });
    }

    if (items.length === 0) {
      return [];
    }

    return this.itemsRepo.createMany(items);
  }

  // ============================================================
  // AGREGAR CUOTA MANUALMENTE
  // ============================================================

  async addInstallmentManually(
    routeSheetId: string,
    installmentId: string,
    user: JwtPayload,
  ) {
    const routeSheet = await this.findById(routeSheetId);

    if (routeSheet.societyId !== user.societyId) {
      throw new ForbiddenException(
        "La hoja de ruta no pertenece a esta sociedad",
      );
    }

    if (
      routeSheet.status === RouteSheetStatus.COMPLETED ||
      routeSheet.status === RouteSheetStatus.CANCELLED
    ) {
      throw new BadRequestException(
        "No se pueden agregar cuotas a una hoja cerrada",
      );
    }

    const installment = await this.installmentRepo.findOne({
      where: {
        installmentId,
      },
    });

    if (!installment) {
      throw new NotFoundException(`Cuota ${installmentId} no encontrada`);
    }

    if (installment.societyId !== user.societyId) {
      throw new ForbiddenException("La cuota no pertenece a esta sociedad");
    }

    // ======================================================
    // CUOTA VIEJA REFINANCIADA
    // ======================================================

    if (installment.isRefinanced) {
      throw new BadRequestException(
        "No se puede agregar una cuota que fue reemplazada por una refinanciación",
      );
    }

    // ======================================================
    // ESTADO
    // ======================================================

    if (!OPEN_INSTALLMENT_STATUSES.includes(installment.status)) {
      throw new BadRequestException(
        "La cuota no se encuentra pendiente de cobro",
      );
    }

    if (Number(installment.remainingAmount) <= 0) {
      throw new BadRequestException("La cuota no tiene saldo pendiente");
    }

    const client = await this.clientRepo.findOne({
      where: {
        clientId: installment.clientId,
      },
    });

    if (!client) {
      throw new NotFoundException("Cliente no encontrado");
    }

    // ======================================================
    // MISMA ZONA
    // ======================================================

    if (client.zoneId !== routeSheet.zoneId) {
      throw new BadRequestException(
        "El cliente no pertenece a la zona de esta hoja",
      );
    }

    // ======================================================
    // NO DUPLICAR
    // ======================================================

    const existing = await this.itemsRepo.findActiveByInstallment(
      installment.installmentId,
    );

    if (existing) {
      throw new ConflictException(
        "La cuota ya pertenece a una hoja de ruta activa",
      );
    }

    // ======================================================
    // ACTUALIZAR MORA A LA FECHA DE ESA HOJA
    // ======================================================

    await this.refreshLateInterest(
      installment,
      this.formatDate(routeSheet.routeDate),
    );

    const created = await this.itemsRepo.createMany([
      {
        routeSheetId: routeSheet.routeSheetId,

        clientId: installment.clientId,

        saleId: installment.saleId,

        installmentId: installment.installmentId,

        itemType: RouteSheetItemType.INSTALLMENT,

        result: RouteSheetItemResult.PENDING,

        notes: "Agregada manualmente por Administración",
      },
    ]);

    return created[0];
  }

  // ============================================================
  // REASIGNAR COBRADOR DE ESTA HOJA
  // ============================================================

  async reassignCollector(
    routeSheetId: string,
    staffId: string,
    user: JwtPayload,
  ) {
    const routeSheet = await this.findById(routeSheetId);

    if (routeSheet.societyId !== user.societyId) {
      throw new ForbiddenException(
        "La hoja de ruta no pertenece a esta sociedad",
      );
    }

    if (
      routeSheet.status === RouteSheetStatus.COMPLETED ||
      routeSheet.status === RouteSheetStatus.CANCELLED
    ) {
      throw new BadRequestException("No se puede reasignar una hoja cerrada");
    }

    await this.validateZoneAndCollector(
      user.societyId,
      routeSheet.zoneId,
      staffId,
    );

    const routeDate = this.formatDate(routeSheet.routeDate);

    const existing = await this.routeSheetsRepo.findActiveForStaffZoneDate(
      staffId,
      routeSheet.zoneId,
      routeDate,
    );

    if (existing && existing.routeSheetId !== routeSheet.routeSheetId) {
      throw new ConflictException(
        "El cobrador ya tiene una hoja activa para esta zona y fecha",
      );
    }

    await this.routeSheetsRepo.updateStaff(routeSheetId, staffId, user.sub);

    return this.findByIdWithItems(routeSheetId, user);
  }

  // ============================================================
  // ACTUALIZAR ESTADO
  // ============================================================

  async updateStatus(
    id: string,
    status: RouteSheetStatus,
    user: JwtPayload,
  ): Promise<void> {
    const routeSheet = await this.findById(id);

    if (routeSheet.societyId !== user.societyId) {
      throw new ForbiddenException(
        "La hoja de ruta no pertenece a esta sociedad",
      );
    }

    if (user.role === StaffRole.COLLECTOR && routeSheet.staffId !== user.sub) {
      throw new ForbiddenException(
        "No eres el cobrador asignado a esta hoja de ruta",
      );
    }

    if (!ALLOWED_TRANSITIONS[routeSheet.status].includes(status)) {
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
          "No se puede completar la hoja mientras existan visitas pendientes",
        );
      }
    }

    await this.routeSheetsRepo.updateStatus(id, status);
  }

  // ============================================================
  // VALIDAR ZONA Y COBRADOR
  // ============================================================

  private async validateZoneAndCollector(
    societyId: string,
    zoneId: string,
    staffId: string,
  ) {
    const zone = await this.zoneRepo.findOne({
      where: {
        zoneId,
      },
    });

    if (!zone || zone.societyId !== societyId) {
      throw new NotFoundException(`Zona ${zoneId} no encontrada`);
    }

    const staff = await this.staffRepo.findOne({
      where: {
        staffId,
      },
    });

    if (!staff) {
      throw new NotFoundException(`Empleado ${staffId} no encontrado`);
    }

    if (staff.role !== StaffRole.COLLECTOR) {
      throw new BadRequestException(
        "El empleado seleccionado no es un cobrador",
      );
    }

    if (staff.primarySocietyId !== societyId) {
      throw new ForbiddenException("El cobrador no pertenece a esta sociedad");
    }

    const staffZone = await this.staffZoneRepo.findOne({
      where: {
        staffId,

        zoneId,

        status: StaffZoneStatus.ACTIVE,
      },
    });

    if (!staffZone) {
      throw new BadRequestException("El cobrador no está asignado a esta zona");
    }
  }

  // ============================================================
  // CALCULAR / ACTUALIZAR MORA
  // ============================================================

  private async refreshLateInterest(
    installment: Installment,
    routeDate: string,
  ) {
    const daysLate = this.calculateDaysLate(installment.dueDate, routeDate);

    const remainingAmount = Number(installment.remainingAmount ?? 0);

    const dailyRate = Number(installment.dailyLateInterestRate ?? 0);

    if (daysLate <= 0 || dailyRate <= 0 || remainingAmount <= 0) {
      return {
        daysLate: 0,

        lateInterestAmount: Number(installment.lateInterestAmount ?? 0),

        totalToCollect: this.roundMoney(
          remainingAmount + Number(installment.lateInterestAmount ?? 0),
        ),
      };
    }

    const lateInterestAmount = this.roundMoney(
      remainingAmount * dailyRate * daysLate,
    );

    const calculationDate = this.parseDate(routeDate);

    await this.installmentRepo.update(
      {
        installmentId: installment.installmentId,
      },
      {
        lateInterestAmount,

        lateInterestCalculatedAt: calculationDate,

        ...(installment.status === InstallmentStatus.PENDING
          ? {
              status: InstallmentStatus.OVERDUE,
            }
          : {}),
      },
    );

    installment.lateInterestAmount = lateInterestAmount;

    installment.lateInterestCalculatedAt = calculationDate;

    if (installment.status === InstallmentStatus.PENDING) {
      installment.status = InstallmentStatus.OVERDUE;
    }

    return {
      daysLate,

      lateInterestAmount,

      totalToCollect: this.roundMoney(remainingAmount + lateInterestAmount),
    };
  }

  // ============================================================
  // ESTADO VISUAL
  // ============================================================

  private getCollectionState(
    installment: Installment,
    routeDate: string | Date,
  ): "overdue" | "due_today" | "partial" | "pending" {
    if (installment.status === InstallmentStatus.PARTIAL) {
      return "partial";
    }

    const dueDate = this.formatDate(installment.dueDate);

    const currentDate = this.formatDate(routeDate);

    if (dueDate < currentDate) {
      return "overdue";
    }

    if (dueDate === currentDate) {
      return "due_today";
    }

    return "pending";
  }

  // ============================================================
  // DÍAS DE ATRASO
  // ============================================================

  private calculateDaysLate(
    dueDate: string | Date,
    referenceDate: string | Date,
  ): number {
    const due = this.parseDate(this.formatDate(dueDate));

    const reference = this.parseDate(this.formatDate(referenceDate));

    const difference = reference.getTime() - due.getTime();

    if (difference <= 0) {
      return 0;
    }

    return Math.floor(difference / (1000 * 60 * 60 * 24));
  }

  // ============================================================
  // HELPERS
  // ============================================================

  private parseDate(value: string): Date {
    const [year, month, day] = value.slice(0, 10).split("-").map(Number);

    return new Date(year, month - 1, day, 0, 0, 0, 0);
  }

  private formatDate(value: string | Date): string {
    if (typeof value === "string") {
      return value.slice(0, 10);
    }

    const year = value.getFullYear();

    const month = String(value.getMonth() + 1).padStart(2, "0");

    const day = String(value.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  private roundMoney(value: number): number {
    return Math.round(value * 100) / 100;
  }
}
