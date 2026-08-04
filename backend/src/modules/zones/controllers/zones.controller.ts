import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
  ApiResponse,
} from "@nestjs/swagger";
import { ZonesService } from "../services/zones.service";
import { CreateZoneDto } from "../dto/create-zone.dto";
import { UpdateZoneDto } from "../dto/update-zone.dto";
import { AssignStaffZoneDto } from "../dto/assign-staff-zone.dto";
import { JwtAuthGuard } from "../../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../../common/guards/roles.guard";
import { SocietyGuard } from "../../../common/guards/society.guard";
import { Roles } from "../../../common/decorators/roles.decorator";
import { CurrentUser } from "../../../common/decorators/current-user.decorator";
import { StaffRole } from "../../../common/enums/staff-role.enum";
import { JwtPayload } from "../../../common/interfaces/jwt-payload.interface";

@ApiTags("zones")
@ApiBearerAuth("access-token")
@UseGuards(JwtAuthGuard, RolesGuard, SocietyGuard)
@Controller("zones")
export class ZonesController {
  constructor(private readonly zonesService: ZonesService) { }

  @Get()
  @Roles(
    StaffRole.SUPER_ADMIN,
    StaffRole.MANAGER,
    StaffRole.ADMIN,
    StaffRole.SELLER,
    StaffRole.COLLECTOR,
  )
  @ApiOperation({ summary: "Listar zonas de la sociedad" })
  @ApiResponse({ status: 200, description: "Lista de zonas" })
  findAll(@CurrentUser() user: JwtPayload) {
    return this.zonesService.findBySociety(user.societyId);
  }

  @Get(":id")
  @Roles(
    StaffRole.SUPER_ADMIN,
    StaffRole.MANAGER,
    StaffRole.ADMIN,
    StaffRole.SELLER,
  )
  @ApiOperation({ summary: "Obtener zona por ID" })
  @ApiParam({ name: "id", description: "UUID de la zona" })
  findOne(
    @Param("id", ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.zonesService.findById(id, user.societyId);
  }

  @Post()
  @Roles(StaffRole.SUPER_ADMIN, StaffRole.MANAGER, StaffRole.ADMIN)
  @ApiOperation({ summary: "Crear zona" })
  @ApiResponse({ status: 201, description: "Zona creada" })
  @ApiResponse({ status: 409, description: "Nombre ya existe en la sociedad" })
  create(@Body() dto: CreateZoneDto, @CurrentUser() user: JwtPayload) {
    return this.zonesService.create(dto, user.societyId);
  }

  @Patch(":id")
  @Roles(StaffRole.SUPER_ADMIN, StaffRole.MANAGER, StaffRole.ADMIN)
  @ApiOperation({ summary: "Actualizar zona" })
  @ApiParam({ name: "id", description: "UUID de la zona" })
  update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateZoneDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.zonesService.update(id, dto, user.societyId);
  }

  @Delete(":id")
  @Roles(StaffRole.SUPER_ADMIN, StaffRole.MANAGER, StaffRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Desactivar zona - soft delete" })
  @ApiParam({ name: "id", description: "UUID de la zona" })
  deactivate(
    @Param("id", ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.zonesService.deactivate(id, user.societyId);
  }

  @Get(":id/staff")
  @Roles(StaffRole.SUPER_ADMIN, StaffRole.MANAGER, StaffRole.ADMIN)
  @ApiOperation({ summary: "Listar staff asignado a la zona" })
  @ApiParam({ name: "id", description: "UUID de la zona" })
  getZoneStaff(
    @Param("id", ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.zonesService.getZoneStaff(id, user.societyId);
  }

  @Post(":id/staff")
  @Roles(StaffRole.SUPER_ADMIN, StaffRole.MANAGER, StaffRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Asignar staff a zona" })
  @ApiParam({ name: "id", description: "UUID de la zona" })
  assignStaff(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: AssignStaffZoneDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.zonesService.assignStaff(id, dto, user.societyId);
  }

  @Delete(":id/staff/:staffId")
  @Roles(StaffRole.SUPER_ADMIN, StaffRole.MANAGER, StaffRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Desasignar staff de zona - soft delete" })
  @ApiParam({ name: "id", description: "UUID de la zona" })
  @ApiParam({ name: "staffId", description: "UUID del empleado" })
  unassignStaff(
    @Param("id", ParseUUIDPipe) id: string,
    @Param("staffId", ParseUUIDPipe) staffId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.zonesService.unassignStaff(id, staffId, user.societyId);
  }
}
