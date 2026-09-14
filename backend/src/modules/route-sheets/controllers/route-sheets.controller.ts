import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";

import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";

import { RouteSheetsService } from "../services/route-sheets.service";

import { CreateRouteSheetDto } from "../dto/create-route-sheet.dto";

import { AddRouteSheetInstallmentDto } from "../dto/add-route-sheet-installment.dto";

import { UpdateRouteSheetStatusDto } from "../dto/update-route-sheet-status.dto";

import { JwtAuthGuard } from "../../../common/guards/jwt-auth.guard";

import { RolesGuard } from "../../../common/guards/roles.guard";

import { SocietyGuard } from "../../../common/guards/society.guard";

import { Roles } from "../../../common/decorators/roles.decorator";

import { CurrentUser } from "../../../common/decorators/current-user.decorator";

import { StaffRole } from "../../../common/enums/staff-role.enum";

import { RouteSheetStatus } from "../../../common/enums/route-sheet-status.enum";

import { JwtPayload } from "../../auth/interfaces/jwt-payload.interface";
import { GenerateRouteSheetsDto } from "../dto/generate-route-sheet.dto";
import { ReassignRouteSheetDto } from "../dto/reassing-route-sheet.dto";

@ApiTags("route-sheets")
@ApiBearerAuth("access-token")
@UseGuards(JwtAuthGuard, RolesGuard, SocietyGuard)
@Controller("route-sheets")
export class RouteSheetsController {
  constructor(private readonly routeSheetsService: RouteSheetsService) {}

  // ============================================================
  // LISTADO
  // ============================================================

  @Get()
  @ApiQuery({
    name: "zoneId",
    required: false,
  })
  @ApiQuery({
    name: "staffId",
    required: false,
  })
  @ApiQuery({
    name: "status",
    required: false,
    enum: RouteSheetStatus,
  })
  @ApiQuery({
    name: "routeDate",
    required: false,
  })
  @ApiOperation({
    summary: "Listar hojas de ruta de la sociedad",
  })
  findAll(
    @CurrentUser()
    user: JwtPayload,

    @Query("zoneId")
    zoneId?: string,

    @Query("staffId")
    staffId?: string,

    @Query("status")
    status?: RouteSheetStatus,

    @Query("routeDate")
    routeDate?: string,
  ) {
    const filters = {
      zoneId,
      staffId,
      status,
      routeDate,
    };

    if (user.role === StaffRole.COLLECTOR) {
      return this.routeSheetsService.findByStaff(
        user.sub,
        user.societyId,
        filters,
      );
    }

    return this.routeSheetsService.findBySociety(user.societyId, filters);
  }

  // ============================================================
  // GENERAR TODAS LAS HOJAS DEL DÍA
  // IMPORTANTE: antes de @Get(":id")
  // ============================================================

  @Post("generate")
  @Roles(StaffRole.ADMIN, StaffRole.MANAGER, StaffRole.SUPER_ADMIN)
  @ApiOperation({
    summary: "Generar automáticamente todas las hojas de ruta de una fecha",
  })
  generate(
    @Body()
    dto: GenerateRouteSheetsDto,

    @CurrentUser()
    user: JwtPayload,
  ) {
    return this.routeSheetsService.generateDaily(dto.routeDate, user);
  }

  // ============================================================
  // DETALLE
  // ============================================================

  @Get(":id")
  @ApiOperation({
    summary: "Detalle de hoja de ruta con sus ítems",
  })
  findOne(
    @Param("id", ParseUUIDPipe)
    id: string,

    @CurrentUser()
    user: JwtPayload,
  ) {
    return this.routeSheetsService.findByIdWithItems(id, user);
  }

  // ============================================================
  // CREAR UNA HOJA
  // ============================================================

  @Post()
  @Roles(StaffRole.ADMIN, StaffRole.MANAGER, StaffRole.SUPER_ADMIN)
  @ApiOperation({
    summary:
      "Generar hoja de ruta automáticamente según cobrador, zona y fecha",
  })
  create(
    @Body()
    dto: CreateRouteSheetDto,

    @CurrentUser()
    user: JwtPayload,
  ) {
    return this.routeSheetsService.create(dto, user);
  }

  // ============================================================
  // AGREGAR CUOTA MANUAL
  // ============================================================

  @Post(":id/installments")
  @Roles(StaffRole.ADMIN, StaffRole.MANAGER, StaffRole.SUPER_ADMIN)
  @ApiOperation({
    summary: "Agregar manualmente una cuota a la hoja",
  })
  addInstallment(
    @Param("id", ParseUUIDPipe)
    id: string,

    @Body()
    dto: AddRouteSheetInstallmentDto,

    @CurrentUser()
    user: JwtPayload,
  ) {
    return this.routeSheetsService.addInstallmentManually(
      id,
      dto.installmentId,
      user,
    );
  }

  // ============================================================
  // REASIGNAR COBRADOR
  // ============================================================

  @Patch(":id/collector")
  @Roles(StaffRole.ADMIN, StaffRole.MANAGER, StaffRole.SUPER_ADMIN)
  @ApiOperation({
    summary: "Reasignar excepcionalmente una hoja a otro cobrador",
  })
  reassignCollector(
    @Param("id", ParseUUIDPipe)
    id: string,

    @Body()
    dto: ReassignRouteSheetDto,

    @CurrentUser()
    user: JwtPayload,
  ) {
    return this.routeSheetsService.reassignCollector(id, dto.staffId, user);
  }

  // ============================================================
  // ESTADO
  // ============================================================

  @Patch(":id/status")
  @Roles(
    StaffRole.ADMIN,
    StaffRole.MANAGER,
    StaffRole.SUPER_ADMIN,
    StaffRole.COLLECTOR,
  )
  @ApiOperation({
    summary: "Actualizar estado de la hoja de ruta",
  })
  updateStatus(
    @Param("id", ParseUUIDPipe)
    id: string,

    @Body()
    dto: UpdateRouteSheetStatusDto,

    @CurrentUser()
    user: JwtPayload,
  ) {
    return this.routeSheetsService.updateStatus(id, dto.status, user);
  }
}
