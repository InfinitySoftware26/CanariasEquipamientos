import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
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

@ApiTags("route-sheets")
@ApiBearerAuth("access-token")
@UseGuards(JwtAuthGuard, RolesGuard, SocietyGuard)
@Controller("route-sheets")
export class RouteSheetsController {
  constructor(private readonly routeSheetsService: RouteSheetsService) {}

  @Get()
  @ApiQuery({ name: "zoneId", required: false })
  @ApiQuery({ name: "staffId", required: false })
  @ApiQuery({ name: "status", required: false, enum: RouteSheetStatus })
  @ApiQuery({ name: "routeDate", required: false })
  @ApiOperation({ summary: "Listar hojas de ruta de la sociedad" })
  findAll(
    @CurrentUser() user: JwtPayload,
    @Query("zoneId") zoneId?: string,
    @Query("staffId") staffId?: string,
    @Query("status") status?: RouteSheetStatus,
    @Query("routeDate") routeDate?: string,
  ) {
    const filters = { zoneId, staffId, status, routeDate };
    if (user.role === StaffRole.COLLECTOR) {
      return this.routeSheetsService.findByStaff(
        user.sub,
        user.societyId,
        filters,
      );
    }
    return this.routeSheetsService.findBySociety(user.societyId, filters);
  }

  @Get(":id")
  @ApiOperation({ summary: "Detalle de hoja de ruta con sus ítems" })
  findOne(@Param("id", ParseUUIDPipe) id: string) {
    return this.routeSheetsService.findByIdWithItems(id);
  }

  @Post()
  @Roles(StaffRole.ADMIN, StaffRole.MANAGER, StaffRole.SUPER_ADMIN)
  @ApiOperation({
    summary:
      "Generar hoja de ruta (auto-completa cuotas y entregas pendientes)",
  })
  create(@Body() dto: CreateRouteSheetDto, @CurrentUser() user: JwtPayload) {
    return this.routeSheetsService.create(dto, user);
  }

  @Patch(":id/status")
  @Roles(
    StaffRole.ADMIN,
    StaffRole.MANAGER,
    StaffRole.SUPER_ADMIN,
    StaffRole.COLLECTOR,
  )
  @ApiOperation({ summary: "Actualizar estado de la hoja de ruta" })
  updateStatus(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateRouteSheetStatusDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.routeSheetsService.updateStatus(id, dto.status, user);
  }
}
