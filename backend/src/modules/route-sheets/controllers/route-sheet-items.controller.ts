import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
  UseGuards,
} from "@nestjs/common";

import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";

import { RouteSheetItemsService } from "../services/route-sheet-items.service";

import { UpdateRouteSheetItemDto } from "../dto/update-route-sheet-item.dto";

import { JwtAuthGuard } from "../../../common/guards/jwt-auth.guard";

import { RolesGuard } from "../../../common/guards/roles.guard";

import { SocietyGuard } from "../../../common/guards/society.guard";

import { Roles } from "../../../common/decorators/roles.decorator";

import { CurrentUser } from "../../../common/decorators/current-user.decorator";

import { StaffRole } from "../../../common/enums/staff-role.enum";

import { JwtPayload } from "../../auth/interfaces/jwt-payload.interface";

@ApiTags("route-sheet-items")
@ApiBearerAuth("access-token")
@UseGuards(JwtAuthGuard, RolesGuard, SocietyGuard)
@Controller("route-sheet-items")
export class RouteSheetItemsController {
  constructor(
    private readonly routeSheetItemsService: RouteSheetItemsService,
  ) {}

  // ============================================================
  // ITEMS DE UNA HOJA
  // ============================================================

  @Get()
  @Roles(
    StaffRole.ADMIN,
    StaffRole.MANAGER,
    StaffRole.COLLECTOR,
    StaffRole.SUPER_ADMIN,
  )
  @ApiOperation({
    summary: "Obtener los items de una hoja de ruta",
  })
  @ApiQuery({
    name: "routeSheetId",
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: "Items obtenidos correctamente",
  })
  async findByRouteSheet(
    @Query("routeSheetId", ParseUUIDPipe)
    routeSheetId: string,
  ) {
    return this.routeSheetItemsService.findByRouteSheet(routeSheetId);
  }

  // ============================================================
  // REGISTRAR RESULTADO
  // ============================================================

  @Patch(":id")
  @Roles(
    StaffRole.COLLECTOR,
    StaffRole.ADMIN,
    StaffRole.MANAGER,
    StaffRole.SUPER_ADMIN,
  )
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: "Registrar el resultado de un item de hoja de ruta",
    description:
      "Permite registrar cobranzas, entregas, recepción de dinero y visitas fallidas.",
  })
  async updateResult(
    @Param("id", ParseUUIDPipe)
    id: string,

    @Body()
    dto: UpdateRouteSheetItemDto,

    @CurrentUser()
    user: JwtPayload,
  ): Promise<void> {
    await this.routeSheetItemsService.updateResult(id, dto, user);
  }

  // ============================================================
  // QUITAR ITEM MANUALMENTE
  // ============================================================

  @Delete(":id")
  @Roles(StaffRole.ADMIN, StaffRole.MANAGER, StaffRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: "Quitar manualmente un item pendiente de una hoja de ruta",
    description:
      "Elimina solamente la relación con la hoja. No elimina la cuota, la venta ni el cliente.",
  })
  @ApiResponse({
    status: 204,
    description: "Item quitado de la hoja",
  })
  @ApiResponse({
    status: 400,
    description: "El item ya fue procesado o la hoja está cerrada",
  })
  async remove(
    @Param("id", ParseUUIDPipe)
    id: string,

    @CurrentUser()
    user: JwtPayload,
  ): Promise<void> {
    await this.routeSheetItemsService.removePendingItem(id, user);
  }
}
