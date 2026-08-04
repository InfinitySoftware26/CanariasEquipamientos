import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { IPaymentsRepository, PAYMENTS_REPOSITORY, PaymentFilters } from '../interfaces/payments-repository.interface';
import {
  IPaymentInstallmentApplicationsRepository,
  PAYMENT_INSTALLMENT_APPLICATIONS_REPOSITORY,
} from '../interfaces/payment-installment-applications-repository.interface';
import { Payment } from '../entities/payment.entity';
import { PaymentInstallmentApplication } from '../entities/payment-installment-application.entity';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { ApplyPaymentDto } from '../dto/apply-payment.dto';
import { InstallmentsService } from '../../installments/services/installments.service';
import { PaymentMethod } from '../../../common/enums/payment-method.enum';
import { JwtPayload } from '../../auth/interfaces/jwt-payload.interface';

export interface RegisterCollectionPayment {
  societyId: string;
  staffId: string;
  amount: number;
  installmentId: string;
  routeSheetItemId: string;
  method?: PaymentMethod;
  notes?: string;
}

@Injectable()
export class PaymentsService {
  constructor(
    @Inject(PAYMENTS_REPOSITORY)
    private readonly paymentsRepo: IPaymentsRepository,
    @Inject(PAYMENT_INSTALLMENT_APPLICATIONS_REPOSITORY)
    private readonly applicationsRepo: IPaymentInstallmentApplicationsRepository,
    private readonly installmentsService: InstallmentsService,
  ) {}

  async findById(id: string): Promise<Payment> {
    const payment = await this.paymentsRepo.findById(id);
    if (!payment) throw new NotFoundException(`Pago ${id} no encontrado`);
    return payment;
  }

  findBySale(saleId: string): Promise<Payment[]> {
    return this.paymentsRepo.findBySale(saleId);
  }

  findBySociety(societyId: string, filters?: PaymentFilters): Promise<Payment[]> {
    return this.paymentsRepo.findBySociety(societyId, filters);
  }

  findApplications(paymentId: string): Promise<PaymentInstallmentApplication[]> {
    return this.applicationsRepo.findByPayment(paymentId);
  }

  async registerPayment(dto: CreatePaymentDto, user: JwtPayload): Promise<Payment> {
    const payment = await this.paymentsRepo.create({
      societyId: user.societyId,
      clientId: dto.clientId,
      saleId: dto.saleId,
      staffId: user.sub,
      amount: dto.amount,
      method: dto.method,
      paymentDate: new Date(),
      notes: dto.notes,
    });

    if (dto.installmentId) {
      await this.applyToInstallment(payment.paymentId, dto.installmentId, dto.amount);
    }

    return payment;
  }

  /**
   * Usado por RouteSheetItemsService al registrar el cobro de una cuota en una visita:
   * deja constancia auditable del pago (Payment) e imputa automáticamente el monto
   * total cobrado a la cuota visitada. saleId/clientId se derivan de la cuota porque
   * RouteSheetItem no completa sale_id para ítems de tipo installment.
   */
  async registerFromCollection(params: RegisterCollectionPayment): Promise<Payment> {
    const installment = await this.installmentsService.findById(params.installmentId);

    const payment = await this.paymentsRepo.create({
      societyId: params.societyId,
      clientId: installment.clientId,
      saleId: installment.saleId,
      staffId: params.staffId,
      routeSheetItemId: params.routeSheetItemId,
      amount: params.amount,
      method: params.method ?? PaymentMethod.CASH,
      paymentDate: new Date(),
      notes: params.notes,
    });

    await this.applyToInstallment(payment.paymentId, params.installmentId, params.amount);

    return payment;
  }

  async applyPayment(paymentId: string, dto: ApplyPaymentDto): Promise<void> {
    const payment = await this.findById(paymentId);
    const alreadyApplied = await this.applicationsRepo.sumByPayment(paymentId);
    const requested = dto.applications.reduce((sum, a) => sum + a.amount, 0);

    if (alreadyApplied + requested > Number(payment.amount)) {
      throw new BadRequestException('La suma imputada supera el monto disponible del pago');
    }

    for (const application of dto.applications) {
      await this.applyToInstallment(paymentId, application.installmentId, application.amount);
    }
  }

  private async applyToInstallment(paymentId: string, installmentId: string, amount: number): Promise<void> {
    const installment = await this.installmentsService.findById(installmentId);
    const remaining = Number(installment.amount) - Number(installment.paidAmount);

    if (amount > remaining) {
      throw new BadRequestException(`El monto imputado (${amount}) supera el saldo pendiente de la cuota (${remaining})`);
    }

    await this.installmentsService.payInstallment(installmentId, amount);
    await this.applicationsRepo.create({ paymentId, installmentId, appliedAmount: amount });
  }
}
