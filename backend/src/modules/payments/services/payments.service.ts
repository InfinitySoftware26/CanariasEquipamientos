import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import {
  IPaymentsRepository,
  PAYMENTS_REPOSITORY,
  PaymentFilters,
} from "../interfaces/payments-repository.interface";

import {
  IPaymentInstallmentApplicationsRepository,
  PAYMENT_INSTALLMENT_APPLICATIONS_REPOSITORY,
} from "../interfaces/payment-installment-applications-repository.interface";

import { Payment } from "../entities/payment.entity";
import { PaymentInstallmentApplication } from "../entities/payment-installment-application.entity";

import { CreatePaymentDto } from "../dto/create-payment.dto";
import { ApplyPaymentDto } from "../dto/apply-payment.dto";

import { InstallmentsService } from "../../installments/services/installments.service";

import { PaymentMethod } from "../../../common/enums/payment-method.enum";

import { JwtPayload } from "../../auth/interfaces/jwt-payload.interface";

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

  // ============================================================
  // CONSULTAS
  // ============================================================

  async findById(id: string): Promise<Payment> {
    const payment = await this.paymentsRepo.findById(id);

    if (!payment) {
      throw new NotFoundException(`Pago ${id} no encontrado`);
    }

    return payment;
  }

  findBySale(saleId: string): Promise<Payment[]> {
    return this.paymentsRepo.findBySale(saleId);
  }

  findBySociety(
    societyId: string,
    filters?: PaymentFilters,
  ): Promise<Payment[]> {
    return this.paymentsRepo.findBySociety(societyId, filters);
  }

  findApplications(
    paymentId: string,
  ): Promise<PaymentInstallmentApplication[]> {
    return this.applicationsRepo.findByPayment(paymentId);
  }

  // ============================================================
  // REGISTRAR PAGO GENERAL
  // ============================================================

  async registerPayment(
    dto: CreatePaymentDto,
    user: JwtPayload,
  ): Promise<Payment> {
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
      await this.applyToInstallment(
        payment.paymentId,
        dto.installmentId,
        dto.amount,
      );
    }

    return payment;
  }

  // ============================================================
  // PAGO DESDE HOJA DE RUTA
  // ============================================================

  async registerFromCollection(
    params: RegisterCollectionPayment,
  ): Promise<Payment> {
    const installment = await this.installmentsService.findById(
      params.installmentId,
    );

    const total = await this.installmentsService.getTotalToCollect(
      params.installmentId,
    );

    const amount = this.roundMoney(params.amount);

    if (amount <= 0) {
      throw new BadRequestException("El monto cobrado debe ser mayor a cero");
    }

    if (amount > total.totalToCollect) {
      throw new BadRequestException(
        `El monto cobrado (${amount}) supera el total pendiente de la cuota (${total.totalToCollect})`,
      );
    }

    const payment = await this.paymentsRepo.create({
      societyId: params.societyId,

      clientId: installment.clientId,

      saleId: installment.saleId,

      staffId: params.staffId,

      routeSheetItemId: params.routeSheetItemId,

      amount,

      method: params.method ?? PaymentMethod.CASH,

      paymentDate: new Date(),

      notes: params.notes,
    });

    await this.applyToInstallment(
      payment.paymentId,
      params.installmentId,
      amount,
    );

    return payment;
  }

  // ============================================================
  // IMPUTACIÓN MANUAL DE PAGO
  // ============================================================

  async applyPayment(paymentId: string, dto: ApplyPaymentDto): Promise<void> {
    const payment = await this.findById(paymentId);

    const alreadyApplied = await this.applicationsRepo.sumByPayment(paymentId);

    const requested = dto.applications.reduce(
      (sum, application) => sum + Number(application.amount),
      0,
    );

    if (
      this.roundMoney(alreadyApplied + requested) >
      this.roundMoney(Number(payment.amount))
    ) {
      throw new BadRequestException(
        "La suma imputada supera el monto disponible del pago",
      );
    }

    for (const application of dto.applications) {
      await this.applyToInstallment(
        paymentId,
        application.installmentId,
        application.amount,
      );
    }
  }

  // ============================================================
  // IMPUTAR A UNA CUOTA
  // ============================================================

  private async applyToInstallment(
    paymentId: string,
    installmentId: string,
    amount: number,
  ): Promise<void> {
    const normalizedAmount = this.roundMoney(amount);

    if (normalizedAmount <= 0) {
      throw new BadRequestException("El monto imputado debe ser mayor a cero");
    }

    /*
     * IMPORTANTE:
     *
     * Ya no usamos solamente:
     *
     * amount - paidAmount
     *
     * porque ahora una cuota puede tener
     * capital + mora.
     */

    const total =
      await this.installmentsService.getTotalToCollect(installmentId);

    if (normalizedAmount > this.roundMoney(total.totalToCollect)) {
      throw new BadRequestException(
        `El monto imputado (${normalizedAmount}) supera el total pendiente de la cuota (${total.totalToCollect})`,
      );
    }

    /*
     * InstallmentsService imputa:
     *
     * 1. mora
     * 2. capital
     */

    await this.installmentsService.payInstallment(
      installmentId,
      normalizedAmount,
    );

    /*
     * appliedAmount representa
     * cuánto dinero de este Payment
     * fue destinado a esta cuota.
     *
     * Puede incluir:
     * mora + capital.
     */

    await this.applicationsRepo.create({
      paymentId,

      installmentId,

      appliedAmount: normalizedAmount,
    });
  }

  // ============================================================
  // DINERO
  // ============================================================

  private roundMoney(value: number): number {
    return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
  }
}
