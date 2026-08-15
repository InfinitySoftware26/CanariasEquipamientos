import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
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
  constructor(private readonly itemsService: RouteSheetItemsService) {}

  @Get()
  @ApiQuery({ name: "routeSheetId", required: true })
  @ApiOperation({ summary: "Listar ítems de una hoja de ruta" })
  findByRouteSheet(@Query("routeSheetId", ParseUUIDPipe) routeSheetId: string) {
    return this.itemsService.findByRouteSheet(routeSheetId);
  }

  @Patch(":id")
  @Roles(
    StaffRole.COLLECTOR,
    StaffRole.ADMIN,
    StaffRole.MANAGER,
    StaffRole.SUPER_ADMIN,
  )
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary:
      "Registrar resultado de visita (cobro, entrega, fallo, reprogramación)",
  })
  updateResult(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateRouteSheetItemDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.itemsService.updateResult(id, dto, user);
  }
}
