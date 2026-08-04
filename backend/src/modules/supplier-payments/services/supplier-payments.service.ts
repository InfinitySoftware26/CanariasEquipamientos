import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import {
  ISupplierPaymentsRepository, SUPPLIER_PAYMENTS_REPOSITORY,
} from '../interfaces/supplier-payments-repository.interface';
import { SupplierPayment } from '../entities/supplier-payment.entity';
import { CreateSupplierPaymentDto } from '../dto/create-supplier-payment.dto';
import { ApplySupplierPaymentDto } from '../dto/apply-supplier-payment.dto';
import { SuppliersService } from '../../suppliers/services/suppliers.service';
import { SupplierInvoicesService } from '../../supplier-invoices/services/supplier-invoices.service';
import { SupplierInvoicePaymentApplication } from '../../supplier-invoices/entities/supplier-invoice-payment-application.entity';
import { JwtPayload } from '../../auth/interfaces/jwt-payload.interface';

@Injectable()
export class SupplierPaymentsService {
  constructor(
    @Inject(SUPPLIER_PAYMENTS_REPOSITORY)
    private readonly supplierPaymentsRepo: ISupplierPaymentsRepository,
    private readonly suppliersService: SuppliersService,
    private readonly supplierInvoicesService: SupplierInvoicesService,
  ) {}

  async findById(id: string): Promise<SupplierPayment> {
    const payment = await this.supplierPaymentsRepo.findById(id);
    if (!payment) throw new NotFoundException(`Pago a proveedor ${id} no encontrado`);
    return payment;
  }

  findBySociety(societyId: string, from?: string, to?: string): Promise<SupplierPayment[]> {
    return this.supplierPaymentsRepo.findBySociety(societyId, from, to);
  }

  async create(dto: CreateSupplierPaymentDto, user: JwtPayload): Promise<SupplierPayment> {
    await this.suppliersService.findById(dto.supplierId);

    const payment = await this.supplierPaymentsRepo.create({
      supplierId: dto.supplierId,
      societyId: user.societyId,
      staffId: user.sub,
      amount: dto.amount,
      method: dto.method,
      paymentDate: new Date(),
      notes: dto.notes,
    });

    if (dto.supplierInvoiceId) {
      await this.supplierInvoicesService.applyPayment(payment.supplierPaymentId, dto.supplierInvoiceId, dto.amount);
    }

    return payment;
  }

  findApplications(supplierPaymentId: string): Promise<SupplierInvoicePaymentApplication[]> {
    return this.supplierInvoicesService.findApplicationsByPayment(supplierPaymentId);
  }

  async applyPayment(supplierPaymentId: string, dto: ApplySupplierPaymentDto): Promise<void> {
    const payment = await this.findById(supplierPaymentId);
    const alreadyApplied = await this.supplierInvoicesService.sumAppliedByPayment(supplierPaymentId);
    const requested = dto.applications.reduce((sum, a) => sum + a.amount, 0);

    if (alreadyApplied + requested > Number(payment.amount)) {
      throw new BadRequestException('La suma imputada supera el monto disponible del pago');
    }

    for (const application of dto.applications) {
      await this.supplierInvoicesService.applyPayment(
        supplierPaymentId, application.supplierInvoiceId, application.amount,
      );
    }
  }

  async getSupplierSummary(supplierId: string): Promise<{ supplierId: string; totalPaid: number; payments: SupplierPayment[] }> {
    await this.suppliersService.findById(supplierId);
    const payments = await this.supplierPaymentsRepo.findBySupplier(supplierId);
    const totalPaid = await this.supplierPaymentsRepo.sumBySupplier(supplierId);
    return { supplierId, totalPaid, payments };
  }
}
