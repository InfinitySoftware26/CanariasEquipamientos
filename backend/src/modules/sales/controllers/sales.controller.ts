import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from "@nestjs/common";

import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
  ApiResponse,
} from "@nestjs/swagger";

import { SalesService } from "../services/sales.service";

import { CreateSaleDto } from "../dto/create-sale.dto";
import { ValidateSaleDto } from "../dto/validate-sale.dto";
import { FailDeliveryDto } from "../dto/fail-delivery.dto";
import { AssignCollectorDto } from "../dto/assign-collector.dto";
import { UpdateObservationDto } from "../dto/update-observation.dto";
import { CloseSaleDto } from "../dto/close-sale.dto";
import { ScheduleDeliveryDto } from "../dto/schedule-delivery.dto";
import { ConfigureCollectionScheduleDto } from "../dto/configure-collection-schedule.dto";

import { JwtAuthGuard } from "../../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../../common/guards/roles.guard";
import { SocietyGuard } from "../../../common/guards/society.guard";

import { Roles } from "../../../common/decorators/roles.decorator";
import { CurrentUser } from "../../../common/decorators/current-user.decorator";

import { StaffRole } from "../../../common/enums/staff-role.enum";
import { CommissionPeriod } from "../../../common/enums/commission-period.enum";

import { JwtPayload } from "../../auth/interfaces/jwt-payload.interface";
import { MarkCollectorDocumentsDto } from "../dto/mark-collector-documents.dto";

@ApiTags("sales")
@ApiBearerAuth("access-token")
@UseGuards(JwtAuthGuard, RolesGuard, SocietyGuard)
@Controller("sales")
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  // ─────────────────────────────────────────────────────────────
  // CONSULTAS
  // ─────────────────────────────────────────────────────────────

  @Get()
  @Roles(StaffRole.ADMIN, StaffRole.MANAGER, StaffRole.SUPER_ADMIN)
  @ApiOperation({
    summary: "Listar todas las ventas de la sociedad",
  })
  findAll(@CurrentUser() user: JwtPayload) {
    return this.salesService.findBySociety(user.societyId);
  }

  @Get("pending")
  @Roles(StaffRole.ADMIN, StaffRole.MANAGER, StaffRole.SUPER_ADMIN)
  @ApiOperation({
    summary: "Ventas pendientes de validación administrativa",
  })
  findPending(@CurrentUser() user: JwtPayload) {
    return this.salesService.findPendingValidation(user.societyId);
  }

  @Get("my")
  @Roles(StaffRole.SELLER, StaffRole.ADMIN, StaffRole.COLLECTOR)
  @ApiOperation({
    summary: "Mis ventas",
  })
  findMy(@CurrentUser() user: JwtPayload) {
    return this.salesService.findBySeller(user.sub, user.societyId);
  }

  @Get("my/commissions")
  @Roles(StaffRole.SELLER)
  @ApiOperation({
    summary: "Comisiones del vendedor filtradas por período",
  })
  @ApiQuery({
    name: "period",
    enum: CommissionPeriod,
    required: false,
    description: "Granularidad del filtro. Default: month",
  })
  @ApiQuery({
    name: "date",
    required: false,
    description: "Fecha de referencia ISO. Ejemplo: 2026-07-23",
  })
  findMyCommissions(
    @CurrentUser() user: JwtPayload,

    @Query("period")
    period: CommissionPeriod = CommissionPeriod.MONTH,

    @Query("date")
    date?: string,
  ) {
    return this.salesService.getSellerCommissions(
      user.sub,
      user.societyId,
      period,
      date,
    );
  }

  @Get("collector")
  @Roles(StaffRole.COLLECTOR)
  @ApiOperation({
    summary: "Ventas asignadas al cobrador",
  })
  findCollector(@CurrentUser() user: JwtPayload) {
    return this.salesService.findByCollector(user.sub, user.societyId);
  }

  @Get(":id")
  @ApiOperation({
    summary: "Obtener venta por ID",
  })
  findOne(
    @Param("id", ParseUUIDPipe)
    id: string,
  ) {
    return this.salesService.findById(id);
  }

  @Get(":id/history")
  @ApiOperation({
    summary: "Historial de actividad de una venta",
  })
  findHistory(
    @Param("id", ParseUUIDPipe)
    id: string,
  ) {
    return this.salesService.findHistory(id);
  }

  @Get(":id/validations")
  @Roles(StaffRole.ADMIN, StaffRole.MANAGER, StaffRole.SUPER_ADMIN)
  @ApiOperation({
    summary: "Validaciones registradas de una venta",
  })
  findValidations(
    @Param("id", ParseUUIDPipe)
    id: string,
  ) {
    return this.salesService.findValidations(id);
  }

  @Get(":id/delivery-attempts")
  @Roles(StaffRole.ADMIN, StaffRole.MANAGER, StaffRole.COLLECTOR)
  @ApiOperation({
    summary: "Intentos de entrega de una venta",
  })
  findDeliveryAttempts(
    @Param("id", ParseUUIDPipe)
    id: string,
  ) {
    return this.salesService.findDeliveryAttempts(id);
  }

  // ─────────────────────────────────────────────────────────────
  // CREAR VENTA
  // ─────────────────────────────────────────────────────────────

  @Post()
  @Roles(StaffRole.SELLER, StaffRole.ADMIN, StaffRole.MANAGER)
  @ApiOperation({
    summary: "Cargar nueva venta",
  })
  create(
    @Body()
    dto: CreateSaleDto,

    @CurrentUser()
    user: JwtPayload,
  ) {
    return this.salesService.createSale(dto, user);
  }

  // ─────────────────────────────────────────────────────────────
  // VALIDACIÓN ADMINISTRATIVA
  // ─────────────────────────────────────────────────────────────

  @Patch(":id/admin-validate")
  @Roles(StaffRole.ADMIN, StaffRole.MANAGER, StaffRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: "Validación administrativa: aprobar o rechazar",
  })
  adminValidate(
    @Param("id", ParseUUIDPipe)
    id: string,

    @Body()
    dto: ValidateSaleDto,

    @CurrentUser()
    user: JwtPayload,
  ) {
    return this.salesService.adminValidate(id, dto, user);
  }

  // ─────────────────────────────────────────────────────────────
  // CONFIGURACIÓN DE COBRANZA
  // ─────────────────────────────────────────────────────────────

  @Patch(":id/collection-schedule")
  @Roles(StaffRole.ADMIN, StaffRole.MANAGER, StaffRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: "Configurar planificación de cobranza de la venta",
    description:
      "Permite definir día fijo, rango mensual, fechas de primera/segunda cuota e interés diario por mora.",
  })
  configureCollectionSchedule(
    @Param("id", ParseUUIDPipe)
    id: string,

    @Body()
    dto: ConfigureCollectionScheduleDto,

    @CurrentUser()
    user: JwtPayload,
  ) {
    return this.salesService.configureCollectionSchedule(id, dto, user);
  }

  // ─────────────────────────────────────────────────────────────
  // VALIDACIÓN AMBIENTAL
  // ─────────────────────────────────────────────────────────────

  @Patch(":id/env-validate")
  @Roles(
    StaffRole.ADMIN,
    StaffRole.MANAGER,
    StaffRole.SUPER_ADMIN,
    StaffRole.COLLECTOR,
  )
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: "Validación ambiental: aprobar o rechazar",
  })
  envValidate(
    @Param("id", ParseUUIDPipe)
    id: string,

    @Body()
    dto: ValidateSaleDto,

    @CurrentUser()
    user: JwtPayload,
  ) {
    return this.salesService.envValidate(id, dto, user);
  }

  // ─────────────────────────────────────────────────────────────
  // ASIGNAR COBRADOR
  // ─────────────────────────────────────────────────────────────

  @Patch(":id/assign-collector")
  @Roles(StaffRole.ADMIN, StaffRole.MANAGER, StaffRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: "Asignar o reasignar cobrador a la venta",
  })
  assignCollector(
    @Param("id", ParseUUIDPipe)
    id: string,

    @Body()
    dto: AssignCollectorDto,

    @CurrentUser()
    user: JwtPayload,
  ) {
    return this.salesService.assignCollector(id, dto.collectorId, user);
  }

  // ─────────────────────────────────────────────────────────────
  // COORDINAR ENTREGA
  // ─────────────────────────────────────────────────────────────

  @Patch(":id/schedule-delivery")
  @Roles(StaffRole.ADMIN, StaffRole.MANAGER, StaffRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: "Coordinar la fecha de entrega de la venta",
  })
  scheduleDelivery(
    @Param("id", ParseUUIDPipe)
    id: string,

    @Body()
    dto: ScheduleDeliveryDto,

    @CurrentUser()
    user: JwtPayload,
  ) {
    return this.salesService.scheduleDelivery(id, dto, user);
  }

  // ─────────────────────────────────────────────────────────────
  // ENTREGA
  // ─────────────────────────────────────────────────────────────

  @Patch(":id/deliver")
  @Roles(StaffRole.COLLECTOR, StaffRole.ADMIN, StaffRole.MANAGER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: "Marcar venta como entregada",
  })
  deliver(
    @Param("id", ParseUUIDPipe)
    id: string,

    @CurrentUser()
    user: JwtPayload,
  ) {
    return this.salesService.deliver(id, user);
  }

  // ─────────────────────────────────────────────────────────────
  // ENTREGA FALLIDA
  // ─────────────────────────────────────────────────────────────

  @Patch(":id/fail-delivery")
  @Roles(StaffRole.COLLECTOR, StaffRole.ADMIN, StaffRole.MANAGER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: "Registrar intento de entrega fallido",
  })
  failDelivery(
    @Param("id", ParseUUIDPipe)
    id: string,

    @Body()
    dto: FailDeliveryDto,

    @CurrentUser()
    user: JwtPayload,
  ) {
    return this.salesService.failDelivery(id, dto, user);
  }

  // ─────────────────────────────────────────────────────────────
  // CERRAR VENTA
  // ─────────────────────────────────────────────────────────────

  @Patch(":id/close")
  @Roles(StaffRole.ADMIN, StaffRole.MANAGER, StaffRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: "Cerrar venta post entrega",
  })
  close(
    @Param("id", ParseUUIDPipe)
    id: string,

    @Body()
    dto: CloseSaleDto,

    @CurrentUser()
    user: JwtPayload,
  ) {
    return this.salesService.close(id, dto, user);
  }

  // ─────────────────────────────────────────────────────────────
  // OBSERVACIÓN
  // ─────────────────────────────────────────────────────────────

  @Patch(":id/observation")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: "Actualizar observación de la venta",
  })
  updateObservation(
    @Param("id", ParseUUIDPipe)
    id: string,

    @Body()
    dto: UpdateObservationDto,
  ) {
    return this.salesService.updateObservation(id, dto.observation);
  }

  @Patch(":id/collector-documents")
  @Roles(StaffRole.ADMIN, StaffRole.MANAGER, StaffRole.SUPER_ADMIN)
  @ApiOperation({
    summary: "Registrar la entrega de documentación al cobrador",
  })
  @ApiResponse({
    status: 200,
    description: "Estado de entrega de documentación actualizado correctamente",
  })
  @ApiResponse({
    status: 400,
    description:
      "La venta no se encuentra en una etapa válida o no tiene cobrador asignado",
  })
  @ApiResponse({
    status: 403,
    description: "La venta no pertenece a la sociedad del usuario",
  })
  async markCollectorDocumentsDelivered(
    @Param("id", ParseUUIDPipe)
    saleId: string,

    @Body()
    dto: MarkCollectorDocumentsDto,

    @CurrentUser()
    user: JwtPayload,
  ) {
    return this.salesService.markCollectorDocumentsDelivered(saleId, dto, user);
  }
}
