import { Injectable, Inject } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { RouteSheetStatus } from "../../../common/enums/route-sheet-status.enum";
import { RouteSheetItemType } from "../../../common/enums/route-sheet-item-type.enum";
import { RouteSheetItemResult } from "../../../common/enums/route-sheet-item-result.enum";
import { SaleStatus } from "../../../common/enums/sale-status.enum";
import { CollectionScheduleType } from "../../../common/enums/collection-schedule-type.enum";
import {
  IRouteSheetsRepository,
  ROUTE_SHEETS_REPOSITORY,
} from "../interfaces/route-sheets-repository.interface";
import {
  IRouteSheetItemsRepository,
  ROUTE_SHEET_ITEMS_REPOSITORY,
} from "../interfaces/route-sheet-items-repository.interface";
import { RouteSheet } from "../entities/route-sheet.entity";
import { RouteSheetItem } from "../entities/route-sheet-item.entity";
import { Client } from "../../clients/entities/client.entity";
import { Installment } from "../../installments/entities/installment.entity";
import { Sale } from "../../sales/entities/sale.entity";
import { JwtPayload } from "../../auth/interfaces/jwt-payload.interface";
import { RouteSheetCalculationsService } from "./route-sheet-calculations.service";
import { RouteSheetValidationService } from "./route-sheet-validation.service";
import { OPEN_INSTALLMENT_STATUSES } from "../route-sheet.constants";

interface RouteCandidate {
  installment: Installment;
  sale: Sale;
  client: Client;
  lateInterestAmount: number;
  daysLate: number;
  totalToCollect: number;
}

interface DeliveryCandidate {
  sale: Sale;
  client: Client;
  /**
   * When firstInstallmentOnDelivery is true, this references installment 1.
   */
  firstInstallment: Installment | null;
}

@Injectable()
export class RouteSheetGenerationService {
  constructor(
    @Inject(ROUTE_SHEETS_REPOSITORY)
    private readonly routeSheetsRepo: IRouteSheetsRepository,
    @Inject(ROUTE_SHEET_ITEMS_REPOSITORY)
    private readonly itemsRepo: IRouteSheetItemsRepository,
    @InjectRepository(Installment)
    private readonly installmentRepo: Repository<Installment>,
    @InjectRepository(Client) private readonly clientRepo: Repository<Client>,
    @InjectRepository(Sale) private readonly saleRepo: Repository<Sale>,
    private readonly calculations: RouteSheetCalculationsService,
    private readonly validation: RouteSheetValidationService,
  ) {}

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
        await this.validation.validateZoneAndCollector(
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

          routeDate: this.calculations.parseDate(routeDate),

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

      const lateInfo = await this.calculations.refreshLateInterest(
        installment,
        routeDate,
      );

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
    const date = this.calculations.parseDate(routeDate);

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

      const manualDate = this.calculations.parseDate(sale.manualCollectionDate);

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
}
