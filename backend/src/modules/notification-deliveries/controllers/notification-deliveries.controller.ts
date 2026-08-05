import {
  Controller, Get, Patch, Param, Query,
  UseGuards, ParseUUIDPipe, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { NotificationDeliveriesService } from '../services/notification-deliveries.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { SocietyGuard } from '../../../common/guards/society.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../auth/interfaces/jwt-payload.interface';
import { NotificationDeliveryStatus } from '../../../common/enums/notification-delivery-status.enum';

@ApiTags('notification-deliveries')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard, SocietyGuard)
@Controller('notification-deliveries')
export class NotificationDeliveriesController {
  constructor(private readonly deliveriesService: NotificationDeliveriesService) {}

  @Get()
  @ApiQuery({ name: 'status', required: false, enum: NotificationDeliveryStatus })
  @ApiOperation({ summary: 'Notificaciones recibidas por el usuario autenticado' })
  findMine(@CurrentUser() user: JwtPayload, @Query('status') status?: NotificationDeliveryStatus) {
    return this.deliveriesService.findForStaff(user.sub, status);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Marcar notificación como leída' })
  markAsRead(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: JwtPayload) {
    return this.deliveriesService.markAsRead(id, user);
  }
}
