import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
  ParseUUIDPipe,
} from "@nestjs/common";

import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";

import { RouteSheetsService } from "../services/route-sheets.service";
import { CreateRouteSheetDto } from "../dto/create-route-sheet.dto";
import { UpdateRouteSheetStatusDto } from "../dto/update-route-sheet-status.dto";

import { JwtAuthGuard } from "../../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../../common/guards/roles.guard";
import { SocietyGuard } from "../../../common/guards/society.guard";

import { Roles } from "../../../common/decorators/roles.decorator";
import { CurrentUser } from "../../../common/decorators/current-user.decorator";

import { StaffRole } from "../../../common/enums/staff-role.enum";
import { RouteSheetStatus } from "../../../common/enums/route-sheet-status.enum";

import { JwtPayload } from "../../auth/interfaces/jwt-payload.interface";
import { Request } from "express";

@ApiTags("route-sheets")
@ApiBearerAuth("access-token")
@UseGuards(JwtAuthGuard, RolesGuard, SocietyGuard)
@Controller("route-sheets")
export class RouteSheetsController {
  constructor(private readonly routeSheetsService: RouteSheetsService) {}

  // ============================================================
  // LISTAR HOJAS DE RUTA
  // ============================================================

  @Get()
  @ApiQuery({ name: "zoneId", required: false })
  @ApiQuery({ name: "staffId", required: false })
  @ApiQuery({
    name: "status",
    required: false,
    enum: RouteSheetStatus,
  })
  @ApiQuery({ name: "routeDate", required: false })
  @ApiOperation({
    summary: "Listar hojas de ruta de la sociedad",
  })
  findAll(
    @CurrentUser() user: JwtPayload,
    @Query("zoneId") zoneId?: string,
    @Query("staffId") staffId?: string,
    @Query("status") status?: RouteSheetStatus,
    @Query("routeDate") routeDate?: string,
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
  // CUOTAS DISPONIBLES PARA CREAR UNA HOJA
  // ============================================================

  @Get("available-installments")
  @ApiOperation({
    summary: "Obtener cuotas disponibles para una zona y cobrador",
  })
  async getAvailableInstallments(
    @Query("zoneId") zoneId: string,
    @Query("staffId") staffId: string,
    @Query("routeDate") routeDate: string,
    @Req() req: Request,
  ) {
    const user = req.user as JwtPayload;

    if (!zoneId || !staffId || !routeDate) {
      throw new BadRequestException(
        "zoneId, staffId y routeDate son requeridos",
      );
    }

    return this.routeSheetsService.getAvailableInstallments(
      zoneId,
      staffId,
      routeDate,
      user.societyId,
    );
  }

  // ============================================================
  // DETALLE
  // ============================================================

  @Get(":id")
  @ApiOperation({
    summary: "Detalle de hoja de ruta con sus ítems",
  })
  findOne(@Param("id", ParseUUIDPipe) id: string) {
    return this.routeSheetsService.findByIdWithItems(id);
  }

  // ============================================================
  // CREAR
  // ============================================================

  @Post()
  @Roles(StaffRole.ADMIN, StaffRole.MANAGER, StaffRole.SUPER_ADMIN)
  @ApiOperation({
    summary: "Crear hoja de ruta con cuotas seleccionadas",
  })
  create(@Body() dto: CreateRouteSheetDto, @CurrentUser() user: JwtPayload) {
    return this.routeSheetsService.create(dto, user);
  }

  // ============================================================
  // ACTUALIZAR ESTADO
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
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateRouteSheetStatusDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.routeSheetsService.updateStatus(id, dto.status, user);
  }
}
