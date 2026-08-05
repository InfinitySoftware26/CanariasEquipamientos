import {
  Controller, Get, Post, Patch, Body, Param, Query,
  UseGuards, ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { FailedVisitsService } from '../services/failed-visits.service';
import { CreateFailedVisitDto } from '../dto/create-failed-visit.dto';
import { RescheduleFailedVisitDto } from '../dto/reschedule-failed-visit.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { SocietyGuard } from '../../../common/guards/society.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { StaffRole } from '../../../common/enums/staff-role.enum';
import { JwtPayload } from '../../auth/interfaces/jwt-payload.interface';

@ApiTags('failed-visits')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard, SocietyGuard)
@Controller('failed-visits')
export class FailedVisitsController {
  constructor(private readonly failedVisitsService: FailedVisitsService) {}

  @Get()
  @ApiQuery({ name: 'routeSheetItemId', required: false })
  @ApiOperation({ summary: 'Listar visitas fallidas (por sociedad o por ítem de hoja de ruta)' })
  findAll(@CurrentUser() user: JwtPayload, @Query('routeSheetItemId') routeSheetItemId?: string) {
    if (routeSheetItemId) return this.failedVisitsService.findByRouteSheetItem(routeSheetItemId);
    return this.failedVisitsService.findBySociety(user.societyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalle de visita fallida' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.failedVisitsService.findById(id);
  }

  @Post()
  @Roles(StaffRole.COLLECTOR, StaffRole.ADMIN, StaffRole.MANAGER, StaffRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Registrar visita de cobranza fallida' })
  create(@Body() dto: CreateFailedVisitDto, @CurrentUser() user: JwtPayload) {
    return this.failedVisitsService.create(dto, user);
  }

  @Patch(':id')
  @Roles(StaffRole.COLLECTOR, StaffRole.ADMIN, StaffRole.MANAGER, StaffRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Reprogramar una visita fallida' })
  reschedule(@Param('id', ParseUUIDPipe) id: string, @Body() dto: RescheduleFailedVisitDto) {
    return this.failedVisitsService.reschedule(id, dto.rescheduledDate);
  }
}
