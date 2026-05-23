import { Injectable, Inject, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ISalesRepository, SALES_REPOSITORY } from '../interfaces/sales-repository.interface';
import { CreateSaleDto } from '../dto/create-sale.dto';
import { Sale } from '../entities/sale.entity';
import { SaleStatus } from '../../../common/enums/sale-status.enum';

@Injectable()
export class SalesService {
  constructor(
    @Inject(SALES_REPOSITORY) private readonly salesRepo: ISalesRepository,
    @InjectDataSource()        private readonly dataSource: DataSource,
  ) {}

  findPendingValidation(societyId: string) { return this.salesRepo.findPendingValidation(societyId); }

  async findById(id: string): Promise<Sale> {
    const sale = await this.salesRepo.findById(id);
    if (!sale) throw new NotFoundException('Venta ' + id + ' no encontrada');
    return sale;
  }

  async createSale(dto: CreateSaleDto, staffId: string, societyId: string): Promise<Sale> {
    await this.validateClientEligibility(dto.clientId);
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();
    try {
      const sale = await this.salesRepo.create({
        clientId: dto.clientId, staffId, societyId,
        paymentType: dto.paymentType, totalAmount: dto.totalAmount,
        saleDate: new Date(dto.saleDate), observation: dto.observation,
        status: SaleStatus.PENDING,
      }, qr);
      // TODO: crear SALES_PRODUCTS, notificar admin
      await qr.commitTransaction();
      return sale;
    } catch (err) {
      await qr.rollbackTransaction();
      throw err;
    } finally {
      await qr.release();
    }
  }

  async validateSale(saleId: string, _staffId: string, status: 'approved' | 'rejected', _obs: string): Promise<void> {
    const sale = await this.findById(saleId);
    if (sale.status !== SaleStatus.PENDING)
      throw new BadRequestException('Solo se pueden validar ventas en estado pending');
    await this.salesRepo.updateStatus(saleId, status === 'approved' ? SaleStatus.APPROVED : SaleStatus.CANCELLED);
    // TODO: registrar SALE_VALIDATIONS, notificar vendedor si rechazado
  }

  private async validateClientEligibility(clientId: string): Promise<void> {
    const active = await this.salesRepo.findActiveByClient(clientId);
    if (active.length > 0) {
      // TODO: verificar regla del 80% y 2 cuotas impagas
    }
  }
}
