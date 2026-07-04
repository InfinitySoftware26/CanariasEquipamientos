import {
  Controller, Get, Post, Patch, Body, Param, Query,
  UseGuards, ParseUUIDPipe, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { SettlementsService } from '../services/settlements.service';
import { CreateSettlementDto } from '../dto/create-settlement.dto';
import { ValidateSettlementDto } from '../dto/validate-settlement.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { SocietyGuard } from '../../../common/guards/society.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { StaffRole } from '../../../common/enums/staff-role.enum';
import { SettlementStatus } from '../../../common/enums/settlement-status.enum';
import { JwtPayload } from '../../auth/interfaces/jwt-payload.interface';

@ApiTags('settlements')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard, SocietyGuard)
@Controller('settlements')
export class SettlementsController {
  constructor(private readonly settlementsService: SettlementsService) {}

  @Get()
  @Roles(StaffRole.ADMIN, StaffRole.MANAGER, StaffRole.SUPER_ADMIN, StaffRole.COLLECTOR)
  @ApiQuery({ name: 'status', required: false, enum: SettlementStatus })
  @ApiQuery({ name: 'staffId', required: false })
  @ApiOperation({ summary: 'Listar liquidaciones de la sociedad' })
  findAll(
    @CurrentUser() user: JwtPayload,
    @Query('status') status?: SettlementStatus,
    @Query('staffId') staffId?: string,
  ) {
    const filters = {
      status,
      staffId: user.role === StaffRole.COLLECTOR ? user.sub : staffId,
    };
    return this.settlementsService.findBySociety(user.societyId, filters);
  }

  @Get(':id')
  @Roles(StaffRole.ADMIN, StaffRole.MANAGER, StaffRole.SUPER_ADMIN, StaffRole.COLLECTOR)
  @ApiOperation({ summary: 'Detalle de liquidación' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.settlementsService.findById(id);
  }

  @Post()
  @Roles(StaffRole.ADMIN, StaffRole.MANAGER, StaffRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Generar liquidación a partir de un cierre validado' })
  create(@Body() dto: CreateSettlementDto) {
    return this.settlementsService.create(dto);
  }

  @Patch(':id/validate')
  @Roles(StaffRole.ADMIN, StaffRole.MANAGER, StaffRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Validar o rechazar liquidación' })
  validate(@Param('id', ParseUUIDPipe) id: string, @Body() dto: ValidateSettlementDto) {
    return this.settlementsService.validate(id, dto);
  }
}
