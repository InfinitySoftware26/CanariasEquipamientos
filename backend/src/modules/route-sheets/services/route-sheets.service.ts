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
      items.map((item) => this.enrichRouteSheetItem(item)),
    );

    return {
      ...this.toResponse(routeSheet),
      items: enrichedItems,
    };
  }

  // ============================================================
  // ENRIQUECER ÍTEM DE HOJA DE RUTA
  // (cliente + cuota + venta con productos)
  // ============================================================

  private async enrichRouteSheetItem(item: RouteSheetItem) {
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
          relations: ["products", "products.product"],
        })
      : null;

    return {
      ...item,

      // ─── CLIENTE ────────────────────────────────────────────
      clientName: client
        ? `${client.name ?? ""} ${client.surname ?? ""}`.trim()
        : null,

      clientDocumentNumber: client?.documentNumber ?? null,
      clientAddress: client?.address ?? null,
      clientPhone: client?.phone ?? null,

      // ─── CUOTA ──────────────────────────────────────────────
      installmentAmount: installment?.amount ?? null,
      installmentNumber: installment?.installmentNumber ?? null,
      installmentStatus: installment?.status ?? null,
      installmentDueDate: installment?.dueDate ?? null,

      // ─── VENTA ──────────────────────────────────────────────
      saleId: sale?.saleId ?? item.saleId ?? null,
      saleTotalAmount: sale?.totalAmount ?? null,

      sale: sale
        ? {
            saleId: sale.saleId,
            totalAmount: sale.totalAmount,
            installmentAmount: sale.installmentAmount,
            installmentsCount: sale.installmentsCount,
            paymentFrequency: sale.paymentFrequency,
            products: (sale.products ?? []).map((sp) => ({
              saleProductId: sp.saleProductId,
              productId: sp.productId,
              quantity: sp.quantity,
              unitPrice: sp.unitPrice,
              subtotal: sp.subtotal,
              product: sp.product
                ? {
                    name: sp.product.name,
                    brand: sp.product.brand,
                    model: sp.product.model,
                  }
                : undefined,
            })),
          }
        : null,
    };
  }

  // ============================================================
  // CUOTAS DISPONIBLES PARA CREAR UNA HOJA DE RUTA
  // ============================================================

  async getAvailableInstallments(
    zoneId: string,
    staffId: string,
    routeDate: string,
    societyId: string,
  ) {
    // ============================================================
    // VALIDAR ZONA
    // ============================================================

    const zone = await this.zoneRepo.findOne({
      where: {
        zoneId,
      },
    });

    if (!zone || zone.societyId !== societyId) {
      throw new NotFoundException(`Zona ${zoneId} no encontrada`);
    }

    // ============================================================
    // VALIDAR COBRADOR
    // ============================================================

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
        "Solo se pueden consultar cuotas para cobradores",
      );
    }

    // ============================================================
    // VALIDAR ASIGNACIÓN COBRADOR -> ZONA
    // ============================================================

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

    // ============================================================
    // BUSCAR CUOTAS ABIERTAS
    // ============================================================

    const installments = await this.installmentRepo
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
        zoneId,
      })
      .andWhere("installment.society_id = :societyId", {
        societyId,
      })
      .andWhere("sale.assigned_collector_id = :staffId", {
        staffId,
      })
      .orderBy("installment.due_date", "ASC")
      .getMany();

    // ============================================================
    // ENRIQUECER CUOTAS CON CLIENTE Y VENTA
    // ============================================================

    const availableInstallments = await Promise.all(
      installments.map(async (installment) => {
        const [client, sale] = await Promise.all([
          this.clientRepo.findOne({
            where: {
              clientId: installment.clientId,
            },
          }),

          this.saleRepo.findOne({
            where: {
              saleId: installment.saleId,
            },
            relations: ["products", "products.product"],
          }),
        ]);

        return {
          // ======================================================
          // CUOTA
          // ======================================================

          installmentId: installment.installmentId,
          installmentNumber: installment.installmentNumber,
          amount: Number(installment.amount),
          paidAmount: Number(installment.paidAmount ?? 0),
          dueDate: installment.dueDate,
          status: installment.status,

          // ======================================================
          // CLIENTE
          // ======================================================

          clientId: installment.clientId,

          clientName: client
            ? `${client.name ?? ""} ${client.surname ?? ""}`.trim()
            : "Cliente sin nombre",

          clientDocumentNumber: client?.documentNumber ?? null,

          clientAddress: client?.address ?? null,

          clientPhone: client?.phone ?? null,

          // ======================================================
          // VENTA
          // ======================================================

          saleId: installment.saleId,

          sale: sale
            ? {
                saleId: sale.saleId,
                totalAmount: Number(sale.totalAmount),
                installmentAmount: Number(sale.installmentAmount),
                installmentsCount: sale.installmentsCount,
                paymentFrequency: sale.paymentFrequency,

                products: (sale.products ?? []).map((saleProduct) => ({
                  saleProductId: saleProduct.saleProductId,
                  productId: saleProduct.productId,
                  quantity: saleProduct.quantity,
                  unitPrice: Number(saleProduct.unitPrice),
                  subtotal: Number(saleProduct.subtotal),

                  product: saleProduct.product
                    ? {
                        name: saleProduct.product.name,
                        brand: saleProduct.product.brand,
                        model: saleProduct.product.model,
                      }
                    : null,
                })),
              }
            : null,
        };
      }),
    );

    // ============================================================
    // LOG DE DEPURACIÓN
    // ============================================================

    console.log("==============================================");

    console.log("📌 CUOTAS DISPONIBLES ENRIQUECIDAS");

    console.log("ZONE:", zoneId);

    console.log("STAFF:", staffId);

    console.log("ROUTE DATE:", routeDate);

    console.log("TOTAL:", availableInstallments.length);

    console.log("DATA:", JSON.stringify(availableInstallments, null, 2));

    console.log("==============================================");

    return availableInstallments;
  }
  // ─── CREAR HOJA DE RUTA ───────────────────────────────────────────────────

  async create(dto: CreateRouteSheetDto, user: JwtPayload) {
    const societyId = user.societyId;

    // ============================================================
    // VALIDAR ZONA
    // ============================================================

    const zone = await this.zoneRepo.findOne({
      where: {
        zoneId: dto.zoneId,
      },
    });

    if (!zone || zone.societyId !== societyId) {
      throw new NotFoundException(`Zona ${dto.zoneId} no encontrada`);
    }

    // ============================================================
    // VALIDAR COBRADOR
    // ============================================================

    const staff = await this.staffRepo.findOne({
      where: {
        staffId: dto.staffId,
      },
    });

    if (!staff) {
      throw new NotFoundException(`Empleado ${dto.staffId} no encontrado`);
    }

    if (staff.role !== StaffRole.COLLECTOR) {
      throw new BadRequestException(
        "Solo se pueden asignar hojas de ruta a cobradores",
      );
    }

    // ============================================================
    // VALIDAR ASIGNACIÓN COBRADOR -> ZONA
    // ============================================================

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

    // ============================================================
    // VALIDAR HOJA ACTIVA EXISTENTE
    // ============================================================

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

    // ============================================================
    // VALIDAR CUOTAS SELECCIONADAS
    // ============================================================

    if (!dto.installmentIds || dto.installmentIds.length === 0) {
      throw new BadRequestException("Debes seleccionar al menos una cuota");
    }

    const installments = await this.installmentRepo.find({
      where: {
        installmentId: In(dto.installmentIds),
        societyId,
      },
    });

    // ============================================================
    // VERIFICAR QUE TODAS LAS CUOTAS EXISTAN
    // ============================================================

    if (installments.length !== dto.installmentIds.length) {
      const foundIds = new Set(
        installments.map((installment) => installment.installmentId),
      );

      const missingIds = dto.installmentIds.filter((id) => !foundIds.has(id));

      throw new BadRequestException(
        `Las siguientes cuotas no existen o no pertenecen a la sociedad: ${missingIds.join(
          ", ",
        )}`,
      );
    }

    // ============================================================
    // VALIDAR QUE LAS CUOTAS CORRESPONDAN A LA ZONA
    // Y AL COBRADOR
    // ============================================================

    const invalidInstallments = [];

    for (const installment of installments) {
      const client = await this.clientRepo.findOne({
        where: {
          clientId: installment.clientId,
        },
      });

      if (!client) {
        invalidInstallments.push(
          `${installment.installmentId} (cliente inexistente)`,
        );
        continue;
      }

      if (client.zoneId !== dto.zoneId) {
        invalidInstallments.push(
          `${installment.installmentId} (cliente fuera de la zona)`,
        );
        continue;
      }

      const sale = await this.saleRepo.findOne({
        where: {
          saleId: installment.saleId,
        },
      });

      if (!sale) {
        invalidInstallments.push(
          `${installment.installmentId} (venta inexistente)`,
        );
        continue;
      }

      if (sale.assignedCollectorId !== dto.staffId) {
        invalidInstallments.push(
          `${installment.installmentId} (venta no asignada al cobrador)`,
        );
      }

      if (!OPEN_INSTALLMENT_STATUSES.includes(installment.status)) {
        invalidInstallments.push(
          `${installment.installmentId} (cuota no disponible)`,
        );
      }

      if (new Date(installment.dueDate) > new Date(dto.routeDate)) {
        invalidInstallments.push(
          `${installment.installmentId} (cuota aún no vencida)`,
        );
      }
    }

    if (invalidInstallments.length > 0) {
      throw new BadRequestException(
        `Hay cuotas no válidas para esta hoja de ruta: ${invalidInstallments.join(
          ", ",
        )}`,
      );
    }

    // ============================================================
    // CREAR HOJA
    // ============================================================

    const routeSheet = await this.routeSheetsRepo.create({
      societyId,
      zoneId: dto.zoneId,
      staffId: dto.staffId,
      assignedBy: user.sub,
      routeDate: new Date(dto.routeDate),
      status: RouteSheetStatus.PENDING,
    });

    // ============================================================
    // CREAR ITEMS A PARTIR DE LAS CUOTAS SELECCIONADAS
    // ============================================================

    const itemsToCreate: Partial<RouteSheetItem>[] = installments.map(
      (installment) => ({
        routeSheetId: routeSheet.routeSheetId,
        clientId: installment.clientId,
        installmentId: installment.installmentId,
        saleId: installment.saleId,
        itemType: RouteSheetItemType.INSTALLMENT,
        result: RouteSheetItemResult.PENDING,
      }),
    );

    const items = await this.itemsRepo.createMany(itemsToCreate);

    // ============================================================
    // RESPUESTA
    // ============================================================

    return {
      ...routeSheet,
      zoneName: zone.name,
      staffName: staff.name,
      items,
    };
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
