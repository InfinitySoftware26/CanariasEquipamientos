import {
  Controller, Get, Post, Body, Param, Res,
  UseGuards, ParseUUIDPipe,
} from '@nestjs/common';
import type { Response } from 'express';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReceiptsService } from '../services/receipts.service';
import { CreateReceiptDto } from '../dto/create-receipt.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { SocietyGuard } from '../../../common/guards/society.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { StaffRole } from '../../../common/enums/staff-role.enum';
import { JwtPayload } from '../../auth/interfaces/jwt-payload.interface';

@ApiTags('receipts')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard, SocietyGuard)
@Controller('receipts')
export class ReceiptsController {
  constructor(private readonly receiptsService: ReceiptsService) {}

  @Get()
  @Roles(StaffRole.ADMIN, StaffRole.MANAGER, StaffRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Listar recibos de la sociedad' })
  findAll(@CurrentUser() user: JwtPayload) {
    return this.receiptsService.findBySociety(user.societyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalle de recibo' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.receiptsService.findById(id);
  }

  @Get(':id/pdf')
  @ApiOperation({ summary: 'Descargar recibo en PDF' })
  async downloadPdf(@Param('id', ParseUUIDPipe) id: string, @Res() res: Response) {
    const receipt = await this.receiptsService.findById(id);
    const pdf = await this.receiptsService.generatePdf(id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="recibo-${receipt.receiptNumber}.pdf"`,
    });
    res.send(pdf);
  }

  @Post()
  @Roles(StaffRole.ADMIN, StaffRole.MANAGER, StaffRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Emitir recibo (numeración automática) para un pago de cliente o proveedor' })
  create(@Body() dto: CreateReceiptDto, @CurrentUser() user: JwtPayload) {
    return this.receiptsService.create(dto, user);
  }
}
