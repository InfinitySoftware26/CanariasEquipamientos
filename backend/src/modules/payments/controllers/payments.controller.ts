import {
  Controller,
  Get,
  Post,
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
import { PaymentsService } from "../services/payments.service";
import { CreatePaymentDto } from "../dto/create-payment.dto";
import { ApplyPaymentDto } from "../dto/apply-payment.dto";
import { JwtAuthGuard } from "../../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../../common/guards/roles.guard";
import { SocietyGuard } from "../../../common/guards/society.guard";
import { Roles } from "../../../common/decorators/roles.decorator";
import { CurrentUser } from "../../../common/decorators/current-user.decorator";
import { StaffRole } from "../../../common/enums/staff-role.enum";
import { JwtPayload } from "../../auth/interfaces/jwt-payload.interface";

@ApiTags("payments")
@ApiBearerAuth("access-token")
@UseGuards(JwtAuthGuard, RolesGuard, SocietyGuard)
@Controller("payments")
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  @Roles(StaffRole.ADMIN, StaffRole.MANAGER, StaffRole.SUPER_ADMIN)
  @ApiQuery({ name: "saleId", required: false })
  @ApiQuery({ name: "clientId", required: false })
  @ApiQuery({ name: "staffId", required: false })
  @ApiQuery({ name: "from", required: false, description: "YYYY-MM-DD" })
  @ApiQuery({ name: "to", required: false, description: "YYYY-MM-DD" })
  @ApiOperation({ summary: "Listar pagos de la sociedad" })
  findAll(
    @CurrentUser() user: JwtPayload,
    @Query("saleId") saleId?: string,
    @Query("clientId") clientId?: string,
    @Query("staffId") staffId?: string,
    @Query("from") from?: string,
    @Query("to") to?: string,
  ) {
    return this.paymentsService.findBySociety(user.societyId, {
      saleId,
      clientId,
      staffId,
      from,
      to,
    });
  }

  @Get(":id")
  @ApiOperation({ summary: "Detalle de un pago" })
  findOne(@Param("id", ParseUUIDPipe) id: string) {
    return this.paymentsService.findById(id);
  }

  @Get(":id/applications")
  @ApiOperation({ summary: "Imputaciones (cuotas) cubiertas por un pago" })
  findApplications(@Param("id", ParseUUIDPipe) id: string) {
    return this.paymentsService.findApplications(id);
  }

  @Post()
  @Roles(
    StaffRole.ADMIN,
    StaffRole.MANAGER,
    StaffRole.COLLECTOR,
    StaffRole.SUPER_ADMIN,
  )
  @ApiOperation({
    summary: "Registrar un pago (imputación automática opcional a una cuota)",
  })
  create(@Body() dto: CreatePaymentDto, @CurrentUser() user: JwtPayload) {
    return this.paymentsService.registerPayment(dto, user);
  }

  @Post(":id/applications")
  @Roles(StaffRole.ADMIN, StaffRole.MANAGER, StaffRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Imputación manual de un pago a una o más cuotas" })
  applyPayment(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: ApplyPaymentDto,
  ) {
    return this.paymentsService.applyPayment(id, dto);
  }
}
