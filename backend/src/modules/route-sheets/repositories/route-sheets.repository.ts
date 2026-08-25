import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { RouteSheet } from "../entities/route-sheet.entity";
import {
  IRouteSheetsRepository,
  RouteSheetFilters,
} from "../interfaces/route-sheets-repository.interface";
import { RouteSheetStatus } from "../../../common/enums/route-sheet-status.enum";

const ROUTE_SHEET_RELATIONS = ["zone", "staff"];

@Injectable()
export class RouteSheetsRepository implements IRouteSheetsRepository {
  constructor(
    @InjectRepository(RouteSheet) private readonly repo: Repository<RouteSheet>,
  ) {}

  findBySociety(
    societyId: string,
    filters?: RouteSheetFilters,
  ): Promise<RouteSheet[]> {
    return this.repo.find({
      where: {
        societyId,
        ...(filters?.zoneId ? { zoneId: filters.zoneId } : {}),
        ...(filters?.staffId ? { staffId: filters.staffId } : {}),
        ...(filters?.status ? { status: filters.status } : {}),
        ...(filters?.routeDate
          ? { routeDate: filters.routeDate as unknown as Date }
          : {}),
      },
      order: { routeDate: "DESC" },
      relations: ROUTE_SHEET_RELATIONS,
    });
  }

  findByStaff(
    staffId: string,
    societyId: string,
    filters?: RouteSheetFilters,
  ): Promise<RouteSheet[]> {
    return this.repo.find({
      where: {
        staffId,
        societyId,
        ...(filters?.zoneId ? { zoneId: filters.zoneId } : {}),
        ...(filters?.status ? { status: filters.status } : {}),
        ...(filters?.routeDate
          ? { routeDate: filters.routeDate as unknown as Date }
          : {}),
      },
      order: { routeDate: "DESC" },
      relations: ROUTE_SHEET_RELATIONS,
    });
  }

  findById(id: string): Promise<RouteSheet | null> {
    return this.repo.findOne({
      where: { routeSheetId: id },
      relations: ROUTE_SHEET_RELATIONS,
    });
  }

  findActiveForStaffZoneDate(
    staffId: string,
    zoneId: string,
    routeDate: string,
  ): Promise<RouteSheet | null> {
    return this.repo
      .createQueryBuilder("rs")
      .where("rs.staff_id = :staffId", { staffId })
      .andWhere("rs.zone_id = :zoneId", { zoneId })
      .andWhere("rs.route_date = :routeDate", { routeDate })
      .andWhere("rs.status != :cancelled", {
        cancelled: RouteSheetStatus.CANCELLED,
      })
      .getOne();
  }

  async create(data: Partial<RouteSheet>): Promise<RouteSheet> {
    return this.repo.save(this.repo.create(data));
  }

  async updateStatus(id: string, status: RouteSheetStatus): Promise<void> {
    await this.repo.update({ routeSheetId: id }, { status });
  }
}
