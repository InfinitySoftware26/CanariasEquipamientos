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
import { RouteSheetStatus } from "../../../common/enums/route-sheet-status.enum";
import { RouteSheetItemType } from "../../../common/enums/route-sheet-item-type.enum";
import { RouteSheetItemResult } from "../../../common/enums/route-sheet-item-result.enum";
import { InstallmentStatus } from "../../../common/enums/installment-status.enum";
import { SaleStatus } from "../../../common/enums/sale-status.enum";
import {
  IRouteSheetItemsRepository,
  ROUTE_SHEET_ITEMS_REPOSITORY,
} from "../interfaces/route-sheet-items-repository.interface";
import { RouteSheetItem } from "../entities/route-sheet-item.entity";
import { Client } from "../../clients/entities/client.entity";
import { Installment } from "../../installments/entities/installment.entity";
import { Sale } from "../../sales/entities/sale.entity";
import { JwtPayload } from "../../auth/interfaces/jwt-payload.interface";
import { RouteSheetQueryService } from "./route-sheet-query.service";
import { RouteSheetCalculationsService } from "./route-sheet-calculations.service";
import { OPEN_INSTALLMENT_STATUSES } from "../route-sheet.constants";

@Injectable()
export class RouteSheetInstallmentService {
  constructor(
    @Inject(ROUTE_SHEET_ITEMS_REPOSITORY)
    private readonly itemsRepo: IRouteSheetItemsRepository,
    @InjectRepository(Installment)
    private readonly installmentRepo: Repository<Installment>,
    @InjectRepository(Client) private readonly clientRepo: Repository<Client>,
    @InjectRepository(Sale) private readonly saleRepo: Repository<Sale>,
    private readonly queryService: RouteSheetQueryService,
    private readonly calculations: RouteSheetCalculationsService,
  ) {}

  // ============================================================
  // CUOTAS DISPONIBLES PARA AGREGAR MANUALMENTE
  // ============================================================

  async getAvailableInstallmentsForRouteSheet(
    routeSheetId: string,
    user: JwtPayload,
  ) {
    const routeSheet = await this.queryService.findById(routeSheetId);

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

    const routeDate = this.calculations.formatDate(routeSheet.routeDate);
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

      await this.calculations.refreshLateInterest(installment, routeDate);

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
        daysLate: this.calculations.calculateDaysLate(
          installment.dueDate,
          routeSheet.routeDate,
        ),
        totalToCollect: this.calculations.roundMoney(
          remainingAmount + lateInterestAmount,
        ),
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
    const routeSheet = await this.queryService.findById(routeSheetId);

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

    await this.calculations.refreshLateInterest(
      installment,
      this.calculations.formatDate(routeSheet.routeDate),
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
}
