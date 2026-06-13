import {
  Controller, Get, Patch, Body, Param,
  UseGuards, ParseUUIDPipe, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IsNumber, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { InstallmentsService } from '../services/installments.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { SocietyGuard } from '../../../common/guards/society.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { StaffRole } from '../../../common/enums/staff-role.enum';
import { JwtPayload } from '../../auth/interfaces/jwt-payload.interface';

class PayInstallmentDto {
  @ApiProperty({ example: 15000 })
  @IsNumber()
  @IsPositive()
  amount!: number;
}

@ApiTags('installments')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard, SocietyGuard)
@Controller('installments')
export class InstallmentsController {
  constructor(private readonly installmentsService: InstallmentsService) {}

  @Get('overdue')
  @Roles(StaffRole.ADMIN, StaffRole.MANAGER, StaffRole.COLLECTOR)
  @ApiOperation({ summary: 'Cuotas vencidas de la sociedad' })
  findOverdue(@CurrentUser() user: JwtPayload) {
    return this.installmentsService.findOverdue(user.societyId);
  }

  @Get('sale/:saleId')
  @ApiOperation({ summary: 'Cuotas de una venta' })
  findBySale(@Param('saleId', ParseUUIDPipe) saleId: string) {
    return this.installmentsService.findBySale(saleId);
  }

  @Get('client/:clientId')
  @Roles(StaffRole.ADMIN, StaffRole.MANAGER, StaffRole.COLLECTOR)
  @ApiOperation({ summary: 'Cuotas de un cliente' })
  findByClient(@Param('clientId', ParseUUIDPipe) clientId: string, @CurrentUser() user: JwtPayload) {
    return this.installmentsService.findByClient(clientId, user.societyId);
  }

  @Patch(':id/pay')
  @Roles(StaffRole.ADMIN, StaffRole.MANAGER, StaffRole.COLLECTOR)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Registrar pago de cuota' })
  pay(@Param('id', ParseUUIDPipe) id: string, @Body() dto: PayInstallmentDto) {
    return this.installmentsService.payInstallment(id, dto.amount);
  }
}
