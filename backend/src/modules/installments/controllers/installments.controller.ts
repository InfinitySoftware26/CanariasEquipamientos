import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";

import {
  ApiBearerAuth,
  ApiOperation,
  ApiProperty,
  ApiTags,
} from "@nestjs/swagger";

import { IsNumber, IsPositive } from "class-validator";

import { InstallmentsService } from "../services/installments.service";

import { UpdateInstallmentDateDto } from "../dto/update-installment-date.dto";

import { UpdateLateInterestDto } from "../dto/update-late-interest.dto";

import { RefinanceInstallmentsDto } from "../dto/refinance-installments.dto";

import { JwtAuthGuard } from "../../../common/guards/jwt-auth.guard";

import { RolesGuard } from "../../../common/guards/roles.guard";

import { SocietyGuard } from "../../../common/guards/society.guard";

import { Roles } from "../../../common/decorators/roles.decorator";

import { CurrentUser } from "../../../common/decorators/current-user.decorator";

import { StaffRole } from "../../../common/enums/staff-role.enum";

import { JwtPayload } from "../../auth/interfaces/jwt-payload.interface";

class PayInstallmentDto {
  @ApiProperty({
    example: 15000,
  })
  @IsNumber()
  @IsPositive()
  amount!: number;
}

@ApiTags("installments")
@ApiBearerAuth("access-token")
@UseGuards(JwtAuthGuard, RolesGuard, SocietyGuard)
@Controller("installments")
export class InstallmentsController {
  constructor(private readonly installmentsService: InstallmentsService) {}

  // ============================================================
  // CUOTAS VENCIDAS
  // ============================================================

  @Get("overdue")
  @Roles(StaffRole.ADMIN, StaffRole.MANAGER, StaffRole.COLLECTOR)
  @ApiOperation({
    summary: "Cuotas vencidas de la sociedad",
  })
  findOverdue(
    @CurrentUser()
    user: JwtPayload,
  ) {
    return this.installmentsService.findOverdue(user.societyId);
  }

  // ============================================================
  // CUOTAS POR VENTA
  // ============================================================

  @Get("sale/:saleId")
  @ApiOperation({
    summary: "Cuotas de una venta",
  })
  findBySale(
    @Param("saleId", ParseUUIDPipe)
    saleId: string,
  ) {
    return this.installmentsService.findBySale(saleId);
  }

  // ============================================================
  // CUOTAS POR CLIENTE
  // ============================================================

  @Get("client/:clientId")
  @Roles(StaffRole.ADMIN, StaffRole.MANAGER, StaffRole.COLLECTOR)
  @ApiOperation({
    summary: "Cuotas de un cliente",
  })
  findByClient(
    @Param("clientId", ParseUUIDPipe)
    clientId: string,

    @CurrentUser()
    user: JwtPayload,
  ) {
    return this.installmentsService.findByClient(clientId, user.societyId);
  }

  // ============================================================
  // TOTAL ACTUAL A COBRAR
  // ============================================================

  @Get(":id/total-to-collect")
  @Roles(StaffRole.ADMIN, StaffRole.MANAGER, StaffRole.COLLECTOR)
  @ApiOperation({
    summary: "Obtener capital, mora y total actual a cobrar de una cuota",
  })
  getTotalToCollect(
    @Param("id", ParseUUIDPipe)
    id: string,
  ) {
    return this.installmentsService.getTotalToCollect(id);
  }

  // ============================================================
  // ACTUALIZAR VENCIDAS
  // ============================================================

  @Post("refresh-overdue")
  @Roles(StaffRole.ADMIN, StaffRole.MANAGER, StaffRole.SUPER_ADMIN)
  @ApiOperation({
    summary: "Actualizar automáticamente las cuotas vencidas y calcular mora",
  })
  refreshOverdue(
    @CurrentUser()
    user: JwtPayload,
  ) {
    return this.installmentsService.updateOverdueInstallments(user.societyId);
  }

  // ============================================================
  // REFINANCIAR VENTA
  // ============================================================

  @Post("sale/:saleId/refinance")
  @Roles(StaffRole.ADMIN, StaffRole.MANAGER, StaffRole.SUPER_ADMIN)
  @ApiOperation({
    summary: "Refinanciar el saldo pendiente de una venta",
  })
  refinance(
    @Param("saleId", ParseUUIDPipe)
    saleId: string,

    @Body()
    dto: RefinanceInstallmentsDto,

    @CurrentUser()
    user: JwtPayload,
  ) {
    return this.installmentsService.refinance(saleId, dto, user.societyId);
  }

  // ============================================================
  // REGISTRAR PAGO
  // ============================================================

  @Patch(":id/pay")
  @Roles(StaffRole.ADMIN, StaffRole.MANAGER, StaffRole.COLLECTOR)
  @ApiOperation({
    summary: "Registrar pago de cuota. Imputa primero mora y luego capital.",
  })
  pay(
    @Param("id", ParseUUIDPipe)
    id: string,

    @Body()
    dto: PayInstallmentDto,
  ) {
    return this.installmentsService.payInstallment(id, dto.amount);
  }

  // ============================================================
  // CAMBIAR FECHA
  // ============================================================

  @Patch(":id/due-date")
  @Roles(StaffRole.ADMIN, StaffRole.MANAGER, StaffRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: "Modificar fecha de vencimiento de una cuota",
  })
  updateDueDate(
    @Param("id", ParseUUIDPipe)
    id: string,

    @Body()
    dto: UpdateInstallmentDateDto,
  ) {
    return this.installmentsService.updateDueDate(id, dto.dueDate);
  }

  // ============================================================
  // MORA
  // ============================================================

  @Patch(":id/late-interest")
  @Roles(StaffRole.ADMIN, StaffRole.MANAGER, StaffRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: "Modificar manualmente tasa y/o monto de mora de una cuota",
  })
  updateLateInterest(
    @Param("id", ParseUUIDPipe)
    id: string,

    @Body()
    dto: UpdateLateInterestDto,
  ) {
    return this.installmentsService.updateLateInterest(id, dto);
  }
}
