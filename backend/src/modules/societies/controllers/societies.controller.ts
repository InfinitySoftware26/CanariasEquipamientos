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
import { SocietiesService } from "../services/societies.service";
import { CreateSocietyDto } from "../dto/create-society.dto";
import { UpdateSocietyDto } from "../dto/update-society.dto";
import { AssignStaffDto } from "../dto/assign-staff.dto";
import { SocietyResponseDto } from "../dto/society-response.dto";
import { JwtAuthGuard } from "../../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../../common/guards/roles.guard";
import { Roles } from "../../../common/decorators/roles.decorator";
import { CurrentUser } from "../../../common/decorators/current-user.decorator";
import { StaffRole } from "../../../common/enums/staff-role.enum";
import { JwtPayload } from "../../../common/interfaces/jwt-payload.interface";

@ApiTags("societies")
@ApiBearerAuth("access-token")
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("societies")
export class SocietiesController {
  constructor(private readonly societiesService: SocietiesService) {}

  @Get()
  @Roles(StaffRole.MANAGER, StaffRole.ADMIN)
  @ApiOperation({ summary: "Listar todas las sociedades" })
  @ApiResponse({ status: 200, type: [SocietyResponseDto] })
  findAll() {
    return this.societiesService.findAll();
  }

  @Get(":id")
  @Roles(StaffRole.MANAGER, StaffRole.ADMIN)
  @ApiOperation({ summary: "Obtener sociedad por ID" })
  @ApiParam({ name: "id", description: "UUID de la sociedad" })
  @ApiResponse({ status: 200, type: SocietyResponseDto })
  findOne(@Param("id", ParseUUIDPipe) id: string) {
    return this.societiesService.findById(id);
  }

  @Post()
  @Roles(StaffRole.MANAGER)
  @ApiOperation({ summary: "Crear nueva sociedad (solo gerente)" })
  @ApiResponse({ status: 201, type: SocietyResponseDto })
  @ApiResponse({ status: 409, description: "CUIT ya registrado" })
  create(@Body() dto: CreateSocietyDto) {
    return this.societiesService.create(dto);
  }

  @Patch(":id")
  @Roles(StaffRole.MANAGER)
  @ApiOperation({ summary: "Actualizar sociedad (solo gerente)" })
  @ApiParam({ name: "id", description: "UUID de la sociedad" })
  update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateSocietyDto
  ) {
    return this.societiesService.update(id, dto);
  }

  @Delete(":id")
  @Roles(StaffRole.MANAGER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Desactivar sociedad - soft delete (solo gerente)" })
  @ApiParam({ name: "id", description: "UUID de la sociedad" })
  deactivate(@Param("id", ParseUUIDPipe) id: string) {
    return this.societiesService.deactivate(id);
  }

  @Get(":id/staff")
  @Roles(StaffRole.MANAGER, StaffRole.ADMIN)
  @ApiOperation({ summary: "Listar staff asignado a la sociedad" })
  @ApiParam({ name: "id", description: "UUID de la sociedad" })
  getStaff(@Param("id", ParseUUIDPipe) id: string) {
    return this.societiesService.getStaff(id);
  }

  @Post(":id/staff")
  @Roles(StaffRole.SUPER_ADMIN, StaffRole.MANAGER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Asignar staff a una sociedad — solo a la propia sociedad (MANAGER) o cualquiera (SUPER_ADMIN)" })
  @ApiParam({ name: "id", description: "UUID de la sociedad" })
  assignStaff(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: AssignStaffDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.societiesService.assignStaff(
      id,
      dto,
      user.societyId,
      user.role === StaffRole.SUPER_ADMIN,
    );
  }
}
