import {
  Controller, Get, Post, Body, Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CashMovementsService } from '../services/cash-movements.service';
import { CreateCashMovementDto } from '../dto/create-cash-movement.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { SocietyGuard } from '../../../common/guards/society.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { StaffRole } from '../../../common/enums/staff-role.enum';
import { JwtPayload } from '../../auth/interfaces/jwt-payload.interface';

@ApiTags('cash-movements')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard, SocietyGuard)
@Controller('cash-movements')
export class CashMovementsController {
  constructor(private readonly cashMovementsService: CashMovementsService) {}

  @Get()
  @Roles(StaffRole.ADMIN, StaffRole.MANAGER, StaffRole.SUPER_ADMIN)
  @ApiQuery({ name: 'cashboxId', required: false })
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  @ApiOperation({ summary: 'Listar movimientos de caja' })
  findAll(
    @CurrentUser() user: JwtPayload,
    @Query('cashboxId') cashboxId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    if (cashboxId) return this.cashMovementsService.findByCashbox(cashboxId);
    return this.cashMovementsService.findBySociety(user.societyId, from, to);
  }

  @Post()
  @Roles(StaffRole.ADMIN, StaffRole.MANAGER, StaffRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Registrar movimiento de caja (ingreso, egreso o transferencia)' })
  create(@Body() dto: CreateCashMovementDto, @CurrentUser() user: JwtPayload) {
    return this.cashMovementsService.create(dto, user);
  }
}
