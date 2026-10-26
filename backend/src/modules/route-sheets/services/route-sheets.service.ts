import { Injectable } from "@nestjs/common";
import { RouteSheetStatus } from "../../../common/enums/route-sheet-status.enum";
import { CreateRouteSheetDto } from "../dto/create-route-sheet.dto";
import { RouteSheet } from "../entities/route-sheet.entity";
import { RouteSheetFilters } from "../interfaces/route-sheets-repository.interface";
import { JwtPayload } from "../../auth/interfaces/jwt-payload.interface";
import { RouteSheetQueryService } from "./route-sheet-query.service";
import { RouteSheetGenerationService } from "./route-sheet-generation.service";
import { RouteSheetInstallmentService } from "./route-sheet-installment.service";
import { RouteSheetManagementService } from "./route-sheet-management.service";

@Injectable()
export class RouteSheetsService {
  constructor(
    private readonly queryService: RouteSheetQueryService,
    private readonly generationService: RouteSheetGenerationService,
    private readonly installmentService: RouteSheetInstallmentService,
    private readonly managementService: RouteSheetManagementService,
  ) {}

  findBySociety(
    societyId: string,
    filters?: RouteSheetFilters,
  ): Promise<RouteSheet[]> {
    return this.queryService.findBySociety(societyId, filters);
  }

  findByStaff(
    staffId: string,
    societyId: string,
    filters?: RouteSheetFilters,
  ): Promise<RouteSheet[]> {
    return this.queryService.findByStaff(staffId, societyId, filters);
  }

  findById(id: string): Promise<RouteSheet> {
    return this.queryService.findById(id);
  }

  findByIdWithItems(id: string, user: JwtPayload) {
    return this.queryService.findByIdWithItems(id, user);
  }

  create(dto: CreateRouteSheetDto, user: JwtPayload) {
    return this.managementService.create(dto, user);
  }

  generateDaily(routeDate: string, user: JwtPayload) {
    return this.generationService.generateDaily(routeDate, user);
  }

  generateDailyForSociety(
    societyId: string,
    routeDate: string,
    assignedBy?: string,
  ) {
    return this.generationService.generateDailyForSociety(
      societyId,
      routeDate,
      assignedBy,
    );
  }

  getAvailableInstallmentsForRouteSheet(
    routeSheetId: string,
    user: JwtPayload,
  ) {
    return this.installmentService.getAvailableInstallmentsForRouteSheet(
      routeSheetId,
      user,
    );
  }

  addInstallmentManually(
    routeSheetId: string,
    installmentId: string,
    user: JwtPayload,
  ) {
    return this.installmentService.addInstallmentManually(
      routeSheetId,
      installmentId,
      user,
    );
  }

  reassignCollector(routeSheetId: string, staffId: string, user: JwtPayload) {
    return this.managementService.reassignCollector(
      routeSheetId,
      staffId,
      user,
    );
  }

  updateStatus(
    id: string,
    status: RouteSheetStatus,
    user: JwtPayload,
  ): Promise<void> {
    return this.managementService.updateStatus(id, status, user);
  }
}
