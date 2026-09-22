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

import { InstallmentsService } from "../../installments/services/installments.service";

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
// CANDIDATO DE COBRANZA
// ============================================================

interface RouteCandidate {
  installment: Installment;

  sale: Sale;

  client: Client;

  lateInterestAmount: number;

  daysLate: number;

  totalToCollect: number;
}

// ============================================================
// CANDIDATO DE ENTREGA
// ============================================================

interface DeliveryCandidate {
  sale: Sale;

  client: Client;

  /**
   * Si firstInstallmentOnDelivery === true,
   * referencia la cuota Nº 1.
   */
  firstInstallment: Installment | null;
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

    private readonly installmentsService: InstallmentsService,

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

          if (installment) {
            await this.refreshLateInterest(
              installment,
              this.formatDate(routeSheet.routeDate),
            );
          }
        }

        const remainingAmount = Number(installment?.remainingAmount ?? 0);

        const lateInterestAmount = Number(installment?.lateInterestAmount ?? 0);

        /**
         * Para DELIVERY la cuota 1 vence
         * el mismo día de entrega, por lo que
         * normalmente daysLate será 0.
         */
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

          installmentStatus: installment?.status ?? null,

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
     * Hoja extraordinaria.
     *
     * No incorpora cuotas automáticamente.
     * Administración puede agregar una cuota
     * utilizando:
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
  // GENERACIÓN MANUAL DEL DÍA
  // ============================================================

  async generateDaily(routeDate: string, user: JwtPayload) {
    return this.generateDailyForSociety(user.societyId, routeDate, user.sub);
  }

  // ============================================================
  // MOTOR DE GENERACIÓN
  // ============================================================

  /**
   * Tiene DOS fuentes independientes de trabajo:
   *
   * 1. Entregas programadas:
   *    PENDING_DELIVERY + deliveryDate.
   *
   * 2. Cobranzas recurrentes:
   *    venta CLOSED + cuota 2+ + programación.
   *
   * Ambas se agrupan después por:
   *
   * zona + cobrador.
   */
  async generateDailyForSociety(
    societyId: string,
    routeDate: string,
    assignedBy?: string,
  ) {
    const [collectionCandidates, deliveryCandidates] = await Promise.all([
      this.getRouteCandidates(societyId, routeDate),

      this.getDeliveryCandidates(societyId, routeDate),
    ]);

    const groups = new Map<
      string,
      {
        zoneId: string;

        staffId: string;

        collectionCandidates: RouteCandidate[];

        deliveryCandidates: DeliveryCandidate[];
      }
    >();

    // ==========================================================
    // COBRANZAS RECURRENTES
    // ==========================================================

    for (const candidate of collectionCandidates) {
      const staffId = candidate.sale.assignedCollectorId;

      const zoneId = candidate.client.zoneId;

      if (!staffId || !zoneId) {
        continue;
      }

      const key = `${zoneId}:${staffId}`;

      const existingGroup = groups.get(key);

      if (existingGroup) {
        existingGroup.collectionCandidates.push(candidate);

        continue;
      }

      groups.set(key, {
        zoneId,

        staffId,

        collectionCandidates: [candidate],

        deliveryCandidates: [],
      });
    }

    // ==========================================================
    // ENTREGAS
    // ==========================================================

    for (const candidate of deliveryCandidates) {
      const staffId = candidate.sale.assignedCollectorId;

      const zoneId = candidate.client.zoneId;

      if (!staffId || !zoneId) {
        continue;
      }

      const key = `${zoneId}:${staffId}`;

      const existingGroup = groups.get(key);

      if (existingGroup) {
        existingGroup.deliveryCandidates.push(candidate);

        continue;
      }

      groups.set(key, {
        zoneId,

        staffId,

        collectionCandidates: [],

        deliveryCandidates: [candidate],
      });
    }

    const routeSheets: RouteSheet[] = [];

    const skippedGroups: Array<{
      zoneId: string;

      staffId: string;

      reason: string;
    }> = [];

    // ==========================================================
    // CREAR / COMPLETAR HOJAS
    // ==========================================================

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
         * Si ya existe una hoja activa para:
         *
         * cobrador + zona + fecha
         *
         * NO creamos otra.
         *
         * Pero sí verificamos si aparecieron
         * nuevos items después de su creación.
         *
         * Ejemplo:
         * - a las 06:00 se generó por cobranzas;
         * - después Administración coordinó
         *   una entrega para esa misma fecha.
         */
        if (existing) {
          await this.generateInstallmentItems(
            existing,
            group.collectionCandidates,
          );

          await this.generateDeliveryItems(existing, group.deliveryCandidates);

          skippedGroups.push({
            zoneId: group.zoneId,

            staffId: group.staffId,

            reason:
              "La hoja ya existía; se verificaron y agregaron nuevos items pendientes",
          });

          continue;
        }

        const routeSheet = await this.routeSheetsRepo.create({
          societyId,

          zoneId: group.zoneId,

          staffId: group.staffId,

          /**
           * Manual:
           * UUID del administrador.
           *
           * Cron:
           * null.
           */
          assignedBy: assignedBy ?? null,

          routeDate: this.parseDate(routeDate),

          status: RouteSheetStatus.PENDING,

          notes: assignedBy
            ? "Hoja generada manualmente"
            : "Hoja generada automáticamente por el sistema",
        });

        await this.generateInstallmentItems(
          routeSheet,
          group.collectionCandidates,
        );

        await this.generateDeliveryItems(routeSheet, group.deliveryCandidates);

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

      collectionsFound: collectionCandidates.length,

      deliveriesFound: deliveryCandidates.length,
    };
  }

  // ============================================================
  // CANDIDATOS DE ENTREGA
  // ============================================================

  /**
   * Una entrega es completamente independiente
   * de la cobranza recurrente.
   *
   * Esto es necesario porque puede existir:
   *
   * - una entrega programada hoy;
   * - cero cuotas 2+ para cobrar.
   *
   * Aun así el cobrador necesita su hoja.
   */
  private async getDeliveryCandidates(
    societyId: string,
    routeDate: string,
  ): Promise<DeliveryCandidate[]> {
    const sales = await this.saleRepo
      .createQueryBuilder("sale")

      .where("sale.society_id = :societyId", {
        societyId,
      })

      .andWhere("sale.status = :status", {
        status: SaleStatus.PENDING_DELIVERY,
      })

      .andWhere("sale.assigned_collector_id IS NOT NULL")

      /**
       * IMPORTANTE:
       *
       * En Sale la columna real está definida:
       *
       * name: "deliverydate"
       *
       * Por eso usamos deliverydate y NO
       * delivery_date.
       */
      .andWhere("sale.deliverydate = :routeDate", {
        routeDate,
      })

      .getMany();

    if (sales.length === 0) {
      return [];
    }

    const clientIds = [...new Set(sales.map((sale) => sale.clientId))];

    const clients = await this.clientRepo.find({
      where: {
        clientId: In(clientIds),
      },
    });

    const clientsById = new Map(
      clients.map((client) => [client.clientId, client]),
    );

    const candidates: DeliveryCandidate[] = [];

    for (const sale of sales) {
      const client = clientsById.get(sale.clientId);

      if (!client || !client.zoneId) {
        continue;
      }

      /**
       * Evita que una misma venta tenga
       * dos entregas activas.
       */
      const existing = await this.itemsRepo.findActiveDeliveryBySale(
        sale.saleId,
      );

      if (existing) {
        continue;
      }

      let firstInstallment: Installment | null = null;

      /**
       * Si la cuota 1 debe cobrarse en la entrega,
       * buscamos específicamente installmentNumber = 1.
       */
      if (sale.firstInstallmentOnDelivery) {
        firstInstallment = await this.installmentRepo.findOne({
          where: {
            saleId: sale.saleId,

            installmentNumber: 1,
          },
        });

        /**
         * Si falta la cuota 1 tenemos una inconsistencia.
         *
         * No enviamos al cobrador una entrega
         * donde no pueda registrar correctamente
         * el dinero.
         */
        if (!firstInstallment) {
          continue;
        }

        /**
         * Tampoco enviamos una cuota que haya sido
         * refinanciada/reemplazada.
         */
        if (firstInstallment.isRefinanced) {
          continue;
        }
      }

      candidates.push({
        sale,

        client,

        firstInstallment,
      });
    }

    return candidates;
  }

  // ============================================================
  // SELECCIÓN AUTOMÁTICA DE CUOTAS 2+
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
       * No cobramos una cuota futura.
       *
       * Las vencidas continúan siendo candidatas
       * hasta que sean abonadas.
       */
      .andWhere("installment.due_date <= :routeDate", {
        routeDate,
      })

      .andWhere("sale.assigned_collector_id IS NOT NULL")

      /**
       * REGLA DE NEGOCIO:
       *
       * La cobranza recurrente sólo comienza
       * después de que:
       *
       * 1. se entregó el producto;
       * 2. se cobró cuota 1;
       * 3. Administración recibió el dinero;
       * 4. Administración cerró la venta.
       *
       * Por eso las cuotas 2+ automáticas sólo
       * pertenecen a ventas CLOSED.
       */
      .andWhere("sale.status = :closedStatus", {
        closedStatus: SaleStatus.CLOSED,
      });

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
      // SEGURIDAD ADICIONAL: VENTA CERRADA
      // ======================================================

      if (sale.status !== SaleStatus.CLOSED) {
        continue;
      }

      // ======================================================
      // CUOTA 1 PERTENECE AL FLUJO DE ENTREGA
      // ======================================================

      const minimumInstallmentNumber = sale.firstInstallmentOnDelivery ? 2 : 1;

      if (Number(installment.installmentNumber) < minimumInstallmentNumber) {
        continue;
      }

      // ======================================================
      // DÍA COORDINADO POR ADMINISTRACIÓN
      // ======================================================

      if (!this.saleMatchesRouteDate(sale, routeDate)) {
        continue;
      }

      // ======================================================
      // UNA SOLA CUOTA POR VENTA
      // ======================================================

      /**
       * Si cuotas 2, 3 y 4 están vencidas:
       *
       * se manda solamente la más antigua.
       *
       * Hasta que no se pague esa cuota,
       * no se pasa a la siguiente.
       */
      if (selectedSales.has(sale.saleId)) {
        continue;
      }

      // ======================================================
      // NO DUPLICAR EN HOJA ACTIVA
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

    /**
     * Si Administración todavía no configuró
     * una modalidad de cobranza, no existe
     * automatización recurrente.
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
       * Para un rango mensual necesitamos
       * una fecha concreta acordada.
       *
       * Ejemplo:
       *
       * rango permitido = 1 al 10
       * día coordinado = 7
       *
       * No generamos una visita todos
       * los días del 1 al 10.
       */
      if (!sale.manualCollectionDate) {
        return false;
      }

      const manualDate = this.parseDate(sale.manualCollectionDate);

      /*
       * manualCollectionDate funciona como fecha ancla.
       *
       * Ejemplo:
       * primera fecha coordinada = 07/10/2026
       * rango permitido = 1 al 10
       *
       * La automatización vuelve a generar la visita
       * el día 7 de cada mes posterior.
       */
      if (date.getTime() < manualDate.getTime()) {
        return false;
      }

      const coordinatedDay = manualDate.getDate();

      const day = date.getDate();

      if (day !== coordinatedDay) {
        return false;
      }

      return day >= Number(startDay) && day <= Number(endDay);
    }

    return false;
  }

  // ============================================================
  // ITEMS AUTOMÁTICOS DE CUOTA 2+
  // ============================================================

  private async generateInstallmentItems(
    routeSheet: RouteSheet,
    candidates: RouteCandidate[],
  ) {
    const items: Partial<RouteSheetItem>[] = [];

    for (const candidate of candidates) {
      /**
       * Volvemos a validar antes de insertar
       * para mantener idempotencia incluso
       * si el método se ejecutó dos veces.
       */
      const existing = await this.itemsRepo.findActiveByInstallment(
        candidate.installment.installmentId,
      );

      if (existing) {
        continue;
      }

      items.push({
        routeSheetId: routeSheet.routeSheetId,

        clientId: candidate.client.clientId,

        saleId: candidate.sale.saleId,

        installmentId: candidate.installment.installmentId,

        itemType: RouteSheetItemType.INSTALLMENT,

        result: RouteSheetItemResult.PENDING,
      });
    }

    if (items.length === 0) {
      return [];
    }

    return this.itemsRepo.createMany(items);
  }

  // ============================================================
  // ITEMS DE ENTREGA + CUOTA 1
  // ============================================================

  private async generateDeliveryItems(
    routeSheet: RouteSheet,
    candidates: DeliveryCandidate[],
  ) {
    const items: Partial<RouteSheetItem>[] = [];

    for (const candidate of candidates) {
      const existing = await this.itemsRepo.findActiveDeliveryBySale(
        candidate.sale.saleId,
      );

      if (existing) {
        continue;
      }

      /**
       * Este item representa UNA SOLA VISITA:
       *
       * - entregar producto;
       * - cobrar primera cuota.
       *
       * Por eso no creamos dos items distintos.
       *
       * installmentId queda apuntando a cuota 1.
       */
      items.push({
        routeSheetId: routeSheet.routeSheetId,

        clientId: candidate.client.clientId,

        saleId: candidate.sale.saleId,

        installmentId: candidate.firstInstallment?.installmentId ?? null,

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
  // CUOTAS DISPONIBLES PARA AGREGAR MANUALMENTE
  // ============================================================

  async getAvailableInstallmentsForRouteSheet(
    routeSheetId: string,
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
      return [];
    }

    const installments = await this.installmentRepo.find({
      where: {
        societyId: user.societyId,
        status: In(OPEN_INSTALLMENT_STATUSES),
      },
      order: {
        dueDate: "ASC",
        installmentNumber: "ASC",
      },
    });

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

    const routeDate = this.formatDate(routeSheet.routeDate);
    const available = [];

    for (const installment of installments) {
      if (installment.isRefinanced) {
        continue;
      }

      if (Number(installment.remainingAmount) <= 0) {
        continue;
      }

      const sale = salesById.get(installment.saleId);
      const client = clientsById.get(installment.clientId);

      if (!sale || !client) {
        continue;
      }

      if (sale.status !== SaleStatus.CLOSED) {
        continue;
      }

      if (client.zoneId !== routeSheet.zoneId) {
        continue;
      }

      if (sale.assignedCollectorId !== routeSheet.staffId) {
        continue;
      }

      if (
        sale.firstInstallmentOnDelivery &&
        Number(installment.installmentNumber) === 1
      ) {
        continue;
      }

      const activeItem = await this.itemsRepo.findActiveByInstallment(
        installment.installmentId,
      );

      if (activeItem) {
        continue;
      }

      await this.refreshLateInterest(installment, routeDate);

      const remainingAmount = Number(installment.remainingAmount ?? 0);
      const lateInterestAmount = Number(installment.lateInterestAmount ?? 0);

      available.push({
        installmentId: installment.installmentId,
        installmentNumber: installment.installmentNumber,
        amount: Number(installment.amount ?? 0),
        remainingAmount,
        dueDate: installment.dueDate,
        installmentStatus: installment.status,
        lateInterestAmount,
        daysLate: this.calculateDaysLate(
          installment.dueDate,
          routeSheet.routeDate,
        ),
        totalToCollect: this.roundMoney(remainingAmount + lateInterestAmount),
        clientId: client.clientId,
        clientName: client.name ?? null,
        clientDocumentNumber: client.documentNumber ?? null,
        saleId: sale.saleId,
      });
    }

    return available;
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
    // CUOTA REFINANCIADA
    // ======================================================

    if (installment.isRefinanced) {
      throw new BadRequestException(
        "No se puede agregar una cuota que fue reemplazada por una refinanciación",
      );
    }

    // ======================================================
    // ESTADO COBRABLE
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
    // VENTA / COBRADOR / CUOTA 1
    // ======================================================

    const sale = await this.saleRepo.findOne({
      where: {
        saleId: installment.saleId,
      },
    });

    if (!sale) {
      throw new NotFoundException("Venta no encontrada");
    }

    if (sale.status !== SaleStatus.CLOSED) {
      throw new BadRequestException(
        "Sólo se pueden agregar cuotas de ventas cerradas",
      );
    }

    if (sale.assignedCollectorId !== routeSheet.staffId) {
      throw new BadRequestException("La venta está asignada a otro cobrador");
    }

    if (
      sale.firstInstallmentOnDelivery &&
      Number(installment.installmentNumber) === 1
    ) {
      throw new BadRequestException(
        "La cuota 1 pertenece al flujo de entrega y no puede agregarse como cobranza manual",
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
    // ACTUALIZAR MORA
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
  // REASIGNAR COBRADOR
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
  // ACTUALIZAR ESTADO DE LA HOJA
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

    /**
     * Una hoja sólo puede terminarse
     * cuando todas las visitas fueron atendidas.
     */
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
    /**
     * La mora tiene una única fuente de verdad: InstallmentsService.
     *
     * RouteSheetsService no recalcula desde cero para no restaurar
     * mora ya pagada ni pisar ajustes manuales.
     */
    const referenceDate = this.parseDate(routeDate);

    await this.installmentsService.calculateLateInterest(
      installment.installmentId,
      referenceDate,
    );

    const refreshed = await this.installmentsService.findById(
      installment.installmentId,
    );

    const remainingAmount = Number(refreshed.remainingAmount ?? 0);

    const lateInterestAmount = Number(refreshed.lateInterestAmount ?? 0);

    const daysLate = this.calculateDaysLate(refreshed.dueDate, routeDate);

    installment.status = refreshed.status;
    installment.remainingAmount = refreshed.remainingAmount;
    installment.lateInterestAmount = refreshed.lateInterestAmount;
    installment.lateInterestCalculatedAt = refreshed.lateInterestCalculatedAt;

    return {
      daysLate,

      lateInterestAmount: this.roundMoney(lateInterestAmount),

      totalToCollect: this.roundMoney(remainingAmount + lateInterestAmount),
    };
  }

  // ============================================================
  // ESTADO VISUAL DE CUOTA
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
  // HELPERS DE FECHA
  // ============================================================

  private parseDate(value: string | Date): Date {
    if (value instanceof Date) {
      return new Date(
        value.getFullYear(),
        value.getMonth(),
        value.getDate(),
        0,
        0,
        0,
        0,
      );
    }

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

  // ============================================================
  // DINERO
  // ============================================================

  private roundMoney(value: number): number {
    return Math.round(value * 100) / 100;
  }
}
