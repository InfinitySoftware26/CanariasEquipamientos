import {
  Controller, Get, Post, Patch, Body, Param, Query,
  UseGuards, ParseUUIDPipe, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ClosuresService } from '../services/closures.service';
import { CreateClosureDto } from '../dto/create-closure.dto';
import { ValidateClosureDto } from '../dto/validate-closure.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { SocietyGuard } from '../../../common/guards/society.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { StaffRole } from '../../../common/enums/staff-role.enum';
import { DailyClosureStatus } from '../../../common/enums/daily-closure-status.enum';
import { JwtPayload } from '../../auth/interfaces/jwt-payload.interface';

@ApiTags('closures')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard, SocietyGuard)
@Controller('closures')
export class ClosuresController {
  constructor(private readonly closuresService: ClosuresService) {}

  @Get()
  @ApiQuery({ name: 'status', required: false, enum: DailyClosureStatus })
  @ApiQuery({ name: 'closingDate', required: false })
  @ApiOperation({ summary: 'Listar cierres diarios' })
  findAll(
    @CurrentUser() user: JwtPayload,
    @Query('status') status?: DailyClosureStatus,
    @Query('closingDate') closingDate?: string,
  ) {
    const filters = { status, closingDate };
    if (user.role === StaffRole.COLLECTOR) {
      return this.closuresService.findByStaff(user.sub, user.societyId, filters);
    }
    return this.closuresService.findBySociety(user.societyId, filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalle de cierre diario' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.closuresService.findById(id);
  }

  @Get(':id/reconciliation')
  @Roles(StaffRole.ADMIN, StaffRole.MANAGER, StaffRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Conciliar monto declarado vs calculado por el sistema' })
  getReconciliation(@Param('id', ParseUUIDPipe) id: string) {
    return this.closuresService.getReconciliation(id);
  }

  @Post()
  @Roles(StaffRole.COLLECTOR)
  @ApiOperation({ summary: 'Declarar cierre diario de cobranza' })
  create(@Body() dto: CreateClosureDto, @CurrentUser() user: JwtPayload) {
    return this.closuresService.create(dto, user);
  }

  @Patch(':id/validate')
  @Roles(StaffRole.ADMIN, StaffRole.MANAGER, StaffRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Validar o rechazar cierre diario' })
  validate(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ValidateClosureDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.closuresService.validate(id, dto, user);
  }
}
