import { Injectable } from "@nestjs/common";

import { InjectRepository } from "@nestjs/typeorm";

import { Repository } from "typeorm";

import { RouteSheet } from "../entities/route-sheet.entity";

import {
  IRouteSheetsRepository,
  RouteSheetFilters,
} from "../interfaces/route-sheets-repository.interface";

import { RouteSheetStatus } from "../../../common/enums/route-sheet-status.enum";

@Injectable()
export class RouteSheetsRepository implements IRouteSheetsRepository {
  constructor(
    @InjectRepository(RouteSheet)
    private readonly repo: Repository<RouteSheet>,
  ) {}

  // ============================================================
  // LISTAR POR SOCIEDAD
  // ============================================================

  findBySociety(
    societyId: string,
    filters?: RouteSheetFilters,
  ): Promise<RouteSheet[]> {
    return this.repo.find({
      where: {
        societyId,

        ...(filters?.zoneId
          ? {
              zoneId: filters.zoneId,
            }
          : {}),

        ...(filters?.staffId
          ? {
              staffId: filters.staffId,
            }
          : {}),

        ...(filters?.status
          ? {
              status: filters.status,
            }
          : {}),

        ...(filters?.routeDate
          ? {
              routeDate: filters.routeDate as unknown as Date,
            }
          : {}),
      },

      order: {
        routeDate: "DESC",

        createdAt: "DESC",
      },
    });
  }

  // ============================================================
  // LISTAR POR COBRADOR
  // ============================================================

  findByStaff(
    staffId: string,
    societyId: string,
    filters?: RouteSheetFilters,
  ): Promise<RouteSheet[]> {
    return this.repo.find({
      where: {
        staffId,

        societyId,

        ...(filters?.zoneId
          ? {
              zoneId: filters.zoneId,
            }
          : {}),

        ...(filters?.status
          ? {
              status: filters.status,
            }
          : {}),

        ...(filters?.routeDate
          ? {
              routeDate: filters.routeDate as unknown as Date,
            }
          : {}),
      },

      order: {
        routeDate: "DESC",

        createdAt: "DESC",
      },
    });
  }

  // ============================================================
  // BUSCAR POR ID
  // ============================================================

  findById(id: string): Promise<RouteSheet | null> {
    return this.repo.findOne({
      where: {
        routeSheetId: id,
      },
    });
  }

  // ============================================================
  // BUSCAR HOJA ACTIVA POR COBRADOR + ZONA + FECHA
  // ============================================================

  findActiveForStaffZoneDate(
    staffId: string,
    zoneId: string,
    routeDate: string,
  ): Promise<RouteSheet | null> {
    return this.repo
      .createQueryBuilder("routeSheet")

      .where("routeSheet.staff_id = :staffId", {
        staffId,
      })

      .andWhere("routeSheet.zone_id = :zoneId", {
        zoneId,
      })

      .andWhere("routeSheet.route_date = :routeDate", {
        routeDate,
      })

      .andWhere("routeSheet.status != :cancelled", {
        cancelled: RouteSheetStatus.CANCELLED,
      })

      .getOne();
  }

  // ============================================================
  // CREAR HOJA DE RUTA
  // ============================================================

  async create(data: Partial<RouteSheet>): Promise<RouteSheet> {
    const entity = this.repo.create(data);

    return this.repo.save(entity);
  }

  // ============================================================
  // ACTUALIZAR ESTADO
  // ============================================================

  async updateStatus(id: string, status: RouteSheetStatus): Promise<void> {
    await this.repo.update(
      {
        routeSheetId: id,
      },
      {
        status,
      },
    );
  }

  // ============================================================
  // REASIGNAR COBRADOR
  // ============================================================

  async updateStaff(
    id: string,
    staffId: string,
    assignedBy: string | null,
  ): Promise<void> {
    await this.repo.update(
      {
        routeSheetId: id,
      },
      {
        staffId,

        assignedBy,
      },
    );
  }

  // ============================================================
  // ELIMINAR
  // ============================================================

  async delete(id: string): Promise<void> {
    await this.repo.delete({
      routeSheetId: id,
    });
  }
}
