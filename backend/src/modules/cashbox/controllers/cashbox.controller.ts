import {
  Controller, Get, Post, Patch, Body, Param,
  UseGuards, ParseUUIDPipe, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CashboxService } from '../services/cashbox.service';
import { OpenCashboxDto } from '../dto/open-cashbox.dto';
import { CloseCashboxDto } from '../dto/close-cashbox.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { SocietyGuard } from '../../../common/guards/society.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { StaffRole } from '../../../common/enums/staff-role.enum';
import { JwtPayload } from '../../auth/interfaces/jwt-payload.interface';

@ApiTags('cashbox')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard, SocietyGuard)
@Controller('cashbox')
export class CashboxController {
  constructor(private readonly cashboxService: CashboxService) {}

  @Get()
  @Roles(StaffRole.ADMIN, StaffRole.MANAGER, StaffRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Listar cajas de la sociedad' })
  findAll(@CurrentUser() user: JwtPayload) {
    return this.cashboxService.findBySociety(user.societyId);
  }

  @Get('open')
  @Roles(StaffRole.ADMIN, StaffRole.MANAGER, StaffRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Obtener la caja abierta actual de la sociedad' })
  findOpen(@CurrentUser() user: JwtPayload) {
    return this.cashboxService.findOpen(user.societyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalle de caja' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.cashboxService.findById(id);
  }

  @Get(':id/balance')
  @Roles(StaffRole.ADMIN, StaffRole.MANAGER, StaffRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Saldo calculado por el sistema para la caja' })
  getBalance(@Param('id', ParseUUIDPipe) id: string) {
    return this.cashboxService.getBalance(id);
  }

  @Post()
  @Roles(StaffRole.ADMIN, StaffRole.MANAGER, StaffRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Abrir caja' })
  open(@Body() dto: OpenCashboxDto, @CurrentUser() user: JwtPayload) {
    return this.cashboxService.open(dto, user);
  }

  @Patch(':id/close')
  @Roles(StaffRole.ADMIN, StaffRole.MANAGER, StaffRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Cerrar caja' })
  close(@Param('id', ParseUUIDPipe) id: string, @Body() dto: CloseCashboxDto) {
    return this.cashboxService.close(id, dto);
  }
}
