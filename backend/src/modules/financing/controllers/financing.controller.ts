import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    UseGuards,
    ParseUUIDPipe,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FinancingService } from '../services/financing.service';
import { CreateFinancingConfigDto } from '../dto/create-financing-config.dto';
import { UpdateFinancingConfigDto } from '../dto/update-financing-config.dto';
import { CreateFinancingPlanDto } from '../dto/create-financing-plan.dto';
import { UpdateFinancingPlanDto } from '../dto/update-financing-plan.dto';
import { CreatePromotionDto } from '../dto/create-promotion.dto';
import { UpdatePromotionDto } from '../dto/update-promotion.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { SocietyGuard } from '../../../common/guards/society.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { StaffRole } from '../../../common/enums/staff-role.enum';
import { JwtPayload } from '../../auth/interfaces/jwt-payload.interface';

/**
 * FinancingController
 *
 * Controlador único para el módulo de Financiación. Expone endpoints para
 * las 3 entidades: Configuraciones, Planes y Promociones.
 *
 * Todos los endpoints validan societyId del usuario autenticado.
 *
 * Rutas:
 *   /financing/configs      → FinancingConfiguration
 *   /financing/plans        → FinancingPlan
 *   /financing/promotions   → Promotion
 */
@ApiTags('financing')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard, SocietyGuard)
@Controller('financing')
export class FinancingController {
    constructor(private readonly financingService: FinancingService) { }

    // ─── FINANCING CONFIGURATION ──────────────────────────────────────────────

    @Get('configs')
    @ApiOperation({ summary: 'Listar configuraciones de financiación' })
    async findAllConfigs(@CurrentUser() user: JwtPayload) {
        return this.financingService.findAllConfigs(user.societyId);
    }

    @Post('configs')
    @Roles(StaffRole.ADMIN, StaffRole.MANAGER, StaffRole.SUPER_ADMIN)
    @ApiOperation({ summary: 'Crear nueva configuración de financiación' })
    async createConfig(
        @Body() dto: CreateFinancingConfigDto,
        @CurrentUser() user: JwtPayload,
    ) {
        return this.financingService.createConfig(user.societyId, dto);
    }

    @Get('configs/:id')
    @ApiOperation({ summary: 'Obtener configuración de financiación por ID' })
    async findOneConfig(
        @Param('id', ParseUUIDPipe) id: string,
        @CurrentUser() user: JwtPayload,
    ) {
        return this.financingService.findOneConfig(user.societyId, id);
    }

    @Put('configs/:id')
    @Roles(StaffRole.ADMIN, StaffRole.MANAGER, StaffRole.SUPER_ADMIN)
    @ApiOperation({ summary: 'Actualizar configuración de financiación' })
    async updateConfig(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: UpdateFinancingConfigDto,
        @CurrentUser() user: JwtPayload,
    ) {
        return this.financingService.updateConfig(user.societyId, id, dto);
    }

    @Delete('configs/:id')
    @Roles(StaffRole.ADMIN, StaffRole.MANAGER, StaffRole.SUPER_ADMIN)
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Eliminar configuración de financiación' })
    async deleteConfig(
        @Param('id', ParseUUIDPipe) id: string,
        @CurrentUser() user: JwtPayload,
    ) {
        return this.financingService.deleteConfig(user.societyId, id);
    }

    // ─── FINANCING PLAN ────────────────────────────────────────────────────────

    @Get('plans')
    @ApiOperation({ summary: 'Listar planes de financiación' })
    async findAllPlans(@CurrentUser() user: JwtPayload) {
        return this.financingService.findAllPlans(user.societyId);
    }

    @Post('plans')
    @Roles(StaffRole.ADMIN, StaffRole.MANAGER, StaffRole.SUPER_ADMIN)
    @ApiOperation({ summary: 'Crear nuevo plan de financiación' })
    async createPlan(
        @Body() dto: CreateFinancingPlanDto,
        @CurrentUser() user: JwtPayload,
    ) {
        return this.financingService.createPlan(user.societyId, dto);
    }

    @Get('plans/:id')
    @ApiOperation({ summary: 'Obtener plan de financiación por ID' })
    async findOnePlan(
        @Param('id', ParseUUIDPipe) id: string,
        @CurrentUser() user: JwtPayload,
    ) {
        return this.financingService.findOnePlan(user.societyId, id);
    }

    @Put('plans/:id')
    @Roles(StaffRole.ADMIN, StaffRole.MANAGER, StaffRole.SUPER_ADMIN)
    @ApiOperation({ summary: 'Actualizar plan de financiación' })
    async updatePlan(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: UpdateFinancingPlanDto,
        @CurrentUser() user: JwtPayload,
    ) {
        return this.financingService.updatePlan(user.societyId, id, dto);
    }

    @Delete('plans/:id')
    @Roles(StaffRole.ADMIN, StaffRole.MANAGER, StaffRole.SUPER_ADMIN)
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Eliminar plan de financiación' })
    async deletePlan(
        @Param('id', ParseUUIDPipe) id: string,
        @CurrentUser() user: JwtPayload,
    ) {
        return this.financingService.deletePlan(user.societyId, id);
    }

    // ─── PROMOTION ─────────────────────────────────────────────────────────────

    @Get('promotions')
    @ApiOperation({ summary: 'Listar promociones' })
    async findAllPromotions(@CurrentUser() user: JwtPayload) {
        return this.financingService.findAllPromotions(user.societyId);
    }

    @Post('promotions')
    @Roles(StaffRole.ADMIN, StaffRole.MANAGER, StaffRole.SUPER_ADMIN)
    @ApiOperation({ summary: 'Crear nueva promoción' })
    async createPromotion(
        @Body() dto: CreatePromotionDto,
        @CurrentUser() user: JwtPayload,
    ) {
        return this.financingService.createPromotion(user.societyId, dto);
    }

    @Get('promotions/:id')
    @ApiOperation({ summary: 'Obtener promoción por ID' })
    async findOnePromotion(
        @Param('id', ParseUUIDPipe) id: string,
        @CurrentUser() user: JwtPayload,
    ) {
        return this.financingService.findOnePromotion(user.societyId, id);
    }

    @Put('promotions/:id')
    @Roles(StaffRole.ADMIN, StaffRole.MANAGER, StaffRole.SUPER_ADMIN)
    @ApiOperation({ summary: 'Actualizar promoción' })
    async updatePromotion(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: UpdatePromotionDto,
        @CurrentUser() user: JwtPayload,
    ) {
        return this.financingService.updatePromotion(user.societyId, id, dto);
    }

    @Delete('promotions/:id')
    @Roles(StaffRole.ADMIN, StaffRole.MANAGER, StaffRole.SUPER_ADMIN)
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Eliminar promoción' })
    async deletePromotion(
        @Param('id', ParseUUIDPipe) id: string,
        @CurrentUser() user: JwtPayload,
    ) {
        return this.financingService.deletePromotion(user.societyId, id);
    }
}
