import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Inject } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { StaffRole } from "../../../common/enums/staff-role.enum";
import {
  IRouteSheetItemsRepository,
  ROUTE_SHEET_ITEMS_REPOSITORY,
} from "../interfaces/route-sheet-items-repository.interface";
import {
  IRouteSheetsRepository,
  ROUTE_SHEETS_REPOSITORY,
  RouteSheetFilters,
} from "../interfaces/route-sheets-repository.interface";
import { RouteSheet } from "../entities/route-sheet.entity";
import { RouteSheetItem } from "../entities/route-sheet-item.entity";
import { Client } from "../../clients/entities/client.entity";
import { Installment } from "../../installments/entities/installment.entity";
import { Staff } from "../../staff/entities/staff.entity";
import { Zone } from "../../zones/entities/zone.entity";
import { JwtPayload } from "../../auth/interfaces/jwt-payload.interface";
import { RouteSheetCalculationsService } from "./route-sheet-calculations.service";

@Injectable()
export class RouteSheetQueryService {
  constructor(
    @Inject(ROUTE_SHEETS_REPOSITORY)
    private readonly routeSheetsRepo: IRouteSheetsRepository,
    @Inject(ROUTE_SHEET_ITEMS_REPOSITORY)
    private readonly itemsRepo: IRouteSheetItemsRepository,
    @InjectRepository(Zone) private readonly zoneRepo: Repository<Zone>,
    @InjectRepository(Staff) private readonly staffRepo: Repository<Staff>,
    @InjectRepository(Client) private readonly clientRepo: Repository<Client>,
    @InjectRepository(Installment)
    private readonly installmentRepo: Repository<Installment>,
    private readonly calculations: RouteSheetCalculationsService,
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
            await this.calculations.refreshLateInterest(
              installment,
              this.calculations.formatDate(routeSheet.routeDate),
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
          ? this.calculations.calculateDaysLate(
              installment.dueDate,
              routeSheet.routeDate,
            )
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
            ? this.calculations.roundMoney(remainingAmount + lateInterestAmount)
            : null,

          collectionState: installment
            ? this.calculations.getCollectionState(
                installment,
                routeSheet.routeDate,
              )
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
}
