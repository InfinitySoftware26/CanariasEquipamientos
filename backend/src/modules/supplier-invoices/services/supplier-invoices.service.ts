import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import {
  ISupplierInvoicesRepository, SUPPLIER_INVOICES_REPOSITORY, SupplierInvoiceFilters,
} from '../interfaces/supplier-invoices-repository.interface';
import {
  ISupplierInvoicePaymentApplicationsRepository,
  SUPPLIER_INVOICE_PAYMENT_APPLICATIONS_REPOSITORY,
} from '../interfaces/supplier-invoice-payment-applications-repository.interface';
import { SupplierInvoice } from '../entities/supplier-invoice.entity';
import { SupplierInvoicePaymentApplication } from '../entities/supplier-invoice-payment-application.entity';
import { CreateSupplierInvoiceDto } from '../dto/create-supplier-invoice.dto';
import { UpdateSupplierInvoiceDto } from '../dto/update-supplier-invoice.dto';
import { SuppliersService } from '../../suppliers/services/suppliers.service';
import { SupplierInvoiceStatus } from '../../../common/enums/supplier-invoice-status.enum';

@Injectable()
export class SupplierInvoicesService {
  constructor(
    @Inject(SUPPLIER_INVOICES_REPOSITORY)
    private readonly invoicesRepo: ISupplierInvoicesRepository,
    @Inject(SUPPLIER_INVOICE_PAYMENT_APPLICATIONS_REPOSITORY)
    private readonly applicationsRepo: ISupplierInvoicePaymentApplicationsRepository,
    private readonly suppliersService: SuppliersService,
  ) {}

  async findById(id: string): Promise<SupplierInvoice> {
    const invoice = await this.invoicesRepo.findById(id);
    if (!invoice) throw new NotFoundException(`Factura de proveedor ${id} no encontrada`);
    return invoice;
  }

  findBySociety(societyId: string, filters?: SupplierInvoiceFilters): Promise<SupplierInvoice[]> {
    return this.invoicesRepo.findBySociety(societyId, filters);
  }

  findApplications(invoiceId: string): Promise<SupplierInvoicePaymentApplication[]> {
    return this.applicationsRepo.findByInvoice(invoiceId);
  }

  async create(dto: CreateSupplierInvoiceDto, societyId: string): Promise<SupplierInvoice> {
    await this.suppliersService.findById(dto.supplierId);

    return this.invoicesRepo.create({
      societyId,
      supplierId: dto.supplierId,
      invoiceNumber: dto.invoiceNumber,
      issueDate: dto.issueDate,
      dueDate: dto.dueDate,
      totalAmount: dto.totalAmount,
      status: SupplierInvoiceStatus.PENDING,
      notes: dto.notes,
    });
  }

  async update(id: string, dto: UpdateSupplierInvoiceDto): Promise<void> {
    await this.findById(id);
    await this.invoicesRepo.update(id, dto);
  }

  async cancel(id: string): Promise<void> {
    const invoice = await this.findById(id);
    if (invoice.status === SupplierInvoiceStatus.CANCELLED) return;

    const applied = await this.applicationsRepo.sumByInvoice(id);
    if (applied > 0) {
      throw new BadRequestException('No se puede anular una factura con pagos ya imputados');
    }
    await this.invoicesRepo.update(id, { status: SupplierInvoiceStatus.CANCELLED });
  }

  async getBalance(id: string): Promise<{
    invoiceId: string; totalAmount: number; paidAmount: number; balance: number; status: SupplierInvoiceStatus;
  }> {
    const invoice = await this.findById(id);
    const paidAmount = await this.applicationsRepo.sumByInvoice(id);
    return {
      invoiceId: invoice.supplierInvoiceId,
      totalAmount: Number(invoice.totalAmount),
      paidAmount,
      balance: Number(invoice.totalAmount) - paidAmount,
      status: invoice.status,
    };
  }

  async getSupplierDebt(supplierId: string): Promise<{
    supplierId: string; totalInvoiced: number; totalPaid: number; balance: number;
  }> {
    await this.suppliersService.findById(supplierId);
    const { totalInvoiced, totalPaid } = await this.invoicesRepo.sumDebtBySupplier(supplierId);
    return { supplierId, totalInvoiced, totalPaid, balance: totalInvoiced - totalPaid };
  }

  /**
   * Invocado por SupplierPaymentsService al imputar (automática o manualmente) un pago a una factura.
   */
  async applyPayment(supplierPaymentId: string, invoiceId: string, amount: number): Promise<void> {
    const invoice = await this.findById(invoiceId);
    if (invoice.status === SupplierInvoiceStatus.CANCELLED) {
      throw new BadRequestException('No se puede imputar un pago a una factura anulada');
    }

    const applied = await this.applicationsRepo.sumByInvoice(invoiceId);
    const remaining = Number(invoice.totalAmount) - applied;
    if (amount > remaining) {
      throw new BadRequestException(`El monto imputado (${amount}) supera el saldo pendiente de la factura (${remaining})`);
    }

    await this.applicationsRepo.create({ supplierPaymentId, supplierInvoiceId: invoiceId, appliedAmount: amount });

    const status = applied + amount >= Number(invoice.totalAmount)
      ? SupplierInvoiceStatus.PAID
      : SupplierInvoiceStatus.PARTIALLY_PAID;
    await this.invoicesRepo.update(invoiceId, { status });
  }

  sumAppliedByPayment(supplierPaymentId: string): Promise<number> {
    return this.applicationsRepo.sumByPayment(supplierPaymentId);
  }

  findApplicationsByPayment(supplierPaymentId: string): Promise<SupplierInvoicePaymentApplication[]> {
    return this.applicationsRepo.findByPayment(supplierPaymentId);
  }
}
