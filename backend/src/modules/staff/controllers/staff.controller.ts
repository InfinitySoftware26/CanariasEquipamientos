import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { StaffService } from '../services/staff.service';
import { CreateStaffDto } from '../dto/create-staff.dto';
import { CreateSuperAdminDto } from '../dto/create-super-admin.dto';
import { UpdateStaffDto } from '../dto/update-staff.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { StaffResponseDto } from '../dto/staff-response.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { SocietyGuard } from '../../../common/guards/society.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { StaffRole } from '../../../common/enums/staff-role.enum';
import { JwtPayload } from '../../../common/interfaces/jwt-payload.interface';

@ApiTags('staff')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard, SocietyGuard)
@Controller('staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  // ── GET /staff/me ──────────────────────────────────────────────────────────
  @Get('me')
  @ApiOperation({ summary: 'Obtener perfil del usuario autenticado' })
  @ApiResponse({ status: 200, type: StaffResponseDto })
  getProfile(@CurrentUser() user: JwtPayload) {
    return this.staffService.getProfile(user);
  }

  // ── GET /staff ─────────────────────────────────────────────────────────────
  @Get()
  @Roles(StaffRole.SUPER_ADMIN, StaffRole.MANAGER, StaffRole.ADMIN)
  @ApiOperation({ summary: 'Listar empleados de la sociedad' })
  @ApiResponse({ status: 200, type: [StaffResponseDto] })
  findAll(@CurrentUser() user: JwtPayload) {
    return this.staffService.findAll(user.societyId);
  }

  // ── GET /staff/lookup ──────────────────────────────────────────────────────
  @Get('lookup')
  @Roles(StaffRole.SUPER_ADMIN, StaffRole.MANAGER, StaffRole.ADMIN)
  @ApiOperation({
    summary: 'Buscar empleado por email o DNI para autocompletado de formularios',
    description: 'Pasa ?email=... o ?dni=... Devuelve los datos del empleado si existe, o 404.',
  })
  @ApiResponse({ status: 200, type: StaffResponseDto })
  @ApiResponse({ status: 404, description: 'Empleado no encontrado' })
  async lookup(
    @CurrentUser() user: JwtPayload,
    @Query('email') email?: string,
    @Query('dni') dni?: string,
  ) {
    const staff = await this.staffService.lookup(user.societyId, email, dni);
    if (!staff) throw new NotFoundException('Empleado no encontrado');
    return staff;
  }

  // ── GET /staff/:id ─────────────────────────────────────────────────────────
  @Get(':id')
  @Roles(StaffRole.SUPER_ADMIN, StaffRole.MANAGER, StaffRole.ADMIN)
  @ApiOperation({ summary: 'Obtener empleado por ID' })
  @ApiParam({ name: 'id', description: 'UUID del empleado' })
  @ApiResponse({ status: 200, type: StaffResponseDto })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.staffService.findById(id);
  }

  // ── POST /staff ────────────────────────────────────────────────────────────
  @Post()
  @Roles(StaffRole.SUPER_ADMIN, StaffRole.MANAGER, StaffRole.ADMIN)
  @ApiOperation({ summary: 'Registrar nuevo empleado (roles: MANAGER, ADMIN, SELLER, COLLECTOR)' })
  @ApiResponse({ status: 201, type: StaffResponseDto })
  @ApiResponse({ status: 409, description: 'Email o DNI ya registrado' })
  @ApiResponse({ status: 403, description: 'Sin permiso para crear ese rol' })
  create(
    @Body() dto: CreateStaffDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.staffService.create(dto, user);
  }

  // ── POST /staff/super-admin ────────────────────────────────────────────────
  @Post('super-admin')
  @Roles(StaffRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Crear nuevo SUPER_ADMIN — exclusivo para superadmin' })
  @ApiResponse({ status: 201, type: StaffResponseDto })
  @ApiResponse({ status: 409, description: 'Email o DNI ya registrado' })
  createSuperAdmin(
    @Body() dto: CreateSuperAdminDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.staffService.createSuperAdmin(dto, user);
  }

  // ── PATCH /staff/:id ───────────────────────────────────────────────────────
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar datos del empleado' })
  @ApiParam({ name: 'id', description: 'UUID del empleado' })
  @ApiResponse({ status: 200, type: StaffResponseDto })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateStaffDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.staffService.update(id, dto, user);
  }

  // ── PATCH /staff/:id/password ──────────────────────────────────────────────
  @Patch(':id/password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Cambiar contrasena — solo el propio usuario' })
  @ApiParam({ name: 'id', description: 'UUID del empleado' })
  changePassword(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ChangePasswordDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.staffService.changePassword(id, dto, user);
  }

  // ── DELETE /staff/:id ──────────────────────────────────────────────────────
  @Delete(':id')
  @Roles(StaffRole.SUPER_ADMIN, StaffRole.MANAGER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Desactivar empleado — soft delete' })
  @ApiParam({ name: 'id', description: 'UUID del empleado' })
  deactivate(@Param('id', ParseUUIDPipe) id: string) {
    return this.staffService.deactivate(id);
  }
}
