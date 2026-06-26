import {
  Injectable, Inject, BadRequestException,
  NotFoundException, ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ISalesRepository, SALES_REPOSITORY } from '../interfaces/sales-repository.interface';
import { ISaleValidationsRepository, SALE_VALIDATIONS_REPOSITORY } from '../interfaces/sale-validations-repository.interface';
import { IDeliveryAttemptsRepository, DELIVERY_ATTEMPTS_REPOSITORY } from '../interfaces/delivery-attempts-repository.interface';
import { ISaleHistoryRepository, SALE_HISTORY_REPOSITORY } from '../interfaces/sale-history-repository.interface';
import { CreateSaleDto } from '../dto/create-sale.dto';
import { ValidateSaleDto } from '../dto/validate-sale.dto';
import { FailDeliveryDto } from '../dto/fail-delivery.dto';
import { Sale } from '../entities/sale.entity';
import { SaleProduct } from '../entities/sale-product.entity';
import { Installment } from '../../installments/entities/installment.entity';
import { FinancingConfiguration } from '../../financing-config/entities/financing-configuration.entity';
import { SaleStatus } from '../../../common/enums/sale-status.enum';
import { ValidationStep } from '../../../common/enums/validation-step.enum';
import { ValidationStatus } from '../../../common/enums/validation-status.enum';
import { PaymentFrequency } from '../../../common/enums/payment-frequency.enum';
import { InstallmentStatus } from '../../../common/enums/installment-status.enum';
import { StaffRole } from '../../../common/enums/staff-role.enum';
import { JwtPayload } from '../../auth/interfaces/jwt-payload.interface';

@Injectable()
export class SalesService {
  constructor(
    @Inject(SALES_REPOSITORY)
    private readonly salesRepo: ISalesRepository,
    @Inject(SALE_VALIDATIONS_REPOSITORY)
    private readonly validationsRepo: ISaleValidationsRepository,
    @Inject(DELIVERY_ATTEMPTS_REPOSITORY)
    private readonly deliveryAttemptsRepo: IDeliveryAttemptsRepository,
    @Inject(SALE_HISTORY_REPOSITORY)
    private readonly historyRepo: ISaleHistoryRepository,
    @InjectRepository(SaleProduct)
    private readonly saleProductRepo: Repository<SaleProduct>,
    @InjectRepository(Installment)
    private readonly installmentRepo: Repository<Installment>,
    @InjectRepository(FinancingConfiguration)
    private readonly financingConfigRepo: Repository<FinancingConfiguration>,
  ) {}

  // ─── QUERIES ──────────────────────────────────────────────────────────────

  findPendingValidation(societyId: string) {
    return this.salesRepo.findPendingValidation(societyId);
  }

  findBySociety(societyId: string) {
    return this.salesRepo.findBySociety(societyId);
  }

  findBySeller(staffId: string, societyId: string) {
    return this.salesRepo.findBySeller(staffId, societyId);
  }

  findByCollector(collectorId: string, societyId: string) {
    return this.salesRepo.findByCollector(collectorId, societyId);
  }

  findByClient(clientId: string, societyId: string) {
    return this.salesRepo.findByClient(clientId, societyId);
  }

  async findById(id: string): Promise<Sale> {
    const sale = await this.salesRepo.findById(id);
    if (!sale) throw new NotFoundException(`Venta ${id} no encontrada`);
    return sale;
  }

  findValidations(saleId: string) {
    return this.validationsRepo.findBySale(saleId);
  }

  findDeliveryAttempts(saleId: string) {
    return this.deliveryAttemptsRepo.findBySale(saleId);
  }

  findHistory(saleId: string) {
    return this.historyRepo.findBySale(saleId);
  }

  // ─── CREAR VENTA ──────────────────────────────────────────────────────────

  async createSale(dto: CreateSaleDto, user: JwtPayload): Promise<Sale> {
    const { staffId, societyId, name } = this.extractUser(user);

    const totalAmount = dto.products.reduce((sum, p) => sum + p.unitPrice * p.quantity, 0);

    const config = await this.financingConfigRepo.findOne({
      where: { societyId, isActive: true },
    });

    let rate = 0.25;
    if (config) {
      if (dto.installmentsCount === 3) rate = Number(config.installments3Rate);
      else if (dto.installmentsCount === 6) rate = Number(config.installments6Rate);
      else rate = Number(config.installments9Rate);
    }

    const totalWithInterest = Math.round(totalAmount * (1 + rate) * 100) / 100;
    const installmentAmount = Math.round((totalWithInterest / dto.installmentsCount) * 100) / 100;

    const sale = await this.salesRepo.create({
      clientId: dto.clientId,
      staffId,
      societyId,
      totalAmount,
      installmentAmount,
      installmentsCount: dto.installmentsCount,
      paymentFrequency: dto.paymentFrequency,
      firstDueDate: new Date(dto.firstDueDate),
      saleDate: new Date(dto.saleDate),
      observation: dto.observation,
      status: SaleStatus.PENDING_ADMIN_VALIDATION,
    });

    await Promise.all(
      dto.products.map(p =>
        this.saleProductRepo.save(this.saleProductRepo.create({
          saleId: sale.saleId,
          productId: p.productId,
          quantity: p.quantity,
          unitPrice: p.unitPrice,
          subtotal: p.unitPrice * p.quantity,
        })),
      ),
    );

    const dueDates = this.calculateDueDates(
      new Date(dto.firstDueDate),
      dto.installmentsCount,
      dto.paymentFrequency,
    );

    await Promise.all(
      dueDates.map((dueDate, i) =>
        this.installmentRepo.save(this.installmentRepo.create({
          saleId: sale.saleId,
          clientId: dto.clientId,
          societyId,
          installmentNumber: i + 1,
          amount: installmentAmount,
          paidAmount: 0,
          remainingAmount: installmentAmount,
          dueDate,
          paymentFrequency: dto.paymentFrequency,
          status: InstallmentStatus.PENDING,
        })),
      ),
    );

    await this.historyRepo.create({
      saleId: sale.saleId,
      action: 'SALE_CREATED',
      snapshot: sale as unknown as object,
      performedBy: staffId,
      performedByName: name,
    });

    return sale;
  }

  // ─── VALIDACIÓN ADMIN ─────────────────────────────────────────────────────

  async adminValidate(saleId: string, dto: ValidateSaleDto, user: JwtPayload): Promise<void> {
    const { staffId, name } = this.extractUser(user);
    const sale = await this.findById(saleId);

    if (sale.status !== SaleStatus.PENDING_ADMIN_VALIDATION) {
      throw new BadRequestException(
        `La venta debe estar en estado ${SaleStatus.PENDING_ADMIN_VALIDATION}`,
      );
    }

    const newStatus = dto.status === 'approved'
      ? SaleStatus.PENDING_ENVIRONMENTAL_VISIT
      : SaleStatus.REJECTED_ADMIN;

    await this.salesRepo.updateStatus(saleId, newStatus);

    await this.validationsRepo.create({
      saleId,
      staffId,
      step: ValidationStep.ADMIN_VALIDATION,
      status: dto.status === 'approved' ? ValidationStatus.APPROVED : ValidationStatus.REJECTED,
      observations: dto.observations,
      validatedAt: new Date(),
    });

    await this.historyRepo.create({
      saleId,
      action: dto.status === 'approved' ? 'ADMIN_APPROVED' : 'ADMIN_REJECTED',
      snapshot: { previousStatus: sale.status, newStatus, observations: dto.observations } as object,
      performedBy: staffId,
      performedByName: name,
    });
  }

  // ─── VALIDACIÓN AMBIENTAL ─────────────────────────────────────────────────

  async envValidate(saleId: string, dto: ValidateSaleDto, user: JwtPayload): Promise<void> {
    const { staffId, name } = this.extractUser(user);
    const sale = await this.findById(saleId);

    if (sale.status !== SaleStatus.PENDING_ENVIRONMENTAL_VISIT) {
      throw new BadRequestException(
        `La venta debe estar en estado ${SaleStatus.PENDING_ENVIRONMENTAL_VISIT}`,
      );
    }

    const newStatus = dto.status === 'approved'
      ? SaleStatus.PENDING_DELIVERY
      : SaleStatus.ENVIRONMENTAL_REJECTED;

    await this.salesRepo.updateStatus(saleId, newStatus);

    await this.validationsRepo.create({
      saleId,
      staffId,
      step: ValidationStep.ENVIRONMENTAL_VISIT,
      status: dto.status === 'approved' ? ValidationStatus.APPROVED : ValidationStatus.REJECTED,
      observations: dto.observations,
      validatedAt: new Date(),
    });

    await this.historyRepo.create({
      saleId,
      action: dto.status === 'approved' ? 'ENV_VISIT_APPROVED' : 'ENV_VISIT_REJECTED',
      snapshot: { previousStatus: sale.status, newStatus, observations: dto.observations } as object,
      performedBy: staffId,
      performedByName: name,
    });
  }

  // ─── ENTREGA ──────────────────────────────────────────────────────────────

  async deliver(saleId: string, user: JwtPayload): Promise<void> {
    const { staffId, name, role } = this.extractUser(user);
    const sale = await this.findById(saleId);

    if (sale.status !== SaleStatus.PENDING_DELIVERY) {
      throw new BadRequestException(
        `La venta debe estar en estado ${SaleStatus.PENDING_DELIVERY}`,
      );
    }

    if (
      role === StaffRole.COLLECTOR &&
      sale.assignedCollectorId &&
      sale.assignedCollectorId !== staffId
    ) {
      throw new ForbiddenException('No eres el collector asignado a esta venta');
    }

    await this.salesRepo.updateStatus(saleId, SaleStatus.DELIVERED);

    await this.historyRepo.create({
      saleId,
      action: 'DELIVERED',
      snapshot: { previousStatus: sale.status, newStatus: SaleStatus.DELIVERED } as object,
      performedBy: staffId,
      performedByName: name,
    });
  }

  // ─── ENTREGA FALLIDA ──────────────────────────────────────────────────────

  async failDelivery(saleId: string, dto: FailDeliveryDto, user: JwtPayload): Promise<void> {
    const { staffId, name, role } = this.extractUser(user);
    const sale = await this.findById(saleId);

    if (sale.status !== SaleStatus.PENDING_DELIVERY) {
      throw new BadRequestException(
        `La venta debe estar en estado ${SaleStatus.PENDING_DELIVERY}`,
      );
    }

    if (
      role === StaffRole.COLLECTOR &&
      sale.assignedCollectorId &&
      sale.assignedCollectorId !== staffId
    ) {
      throw new ForbiddenException('No eres el collector asignado a esta venta');
    }

    const attemptCount = await this.deliveryAttemptsRepo.countBySale(saleId);

    await this.deliveryAttemptsRepo.create({
      saleId,
      staffId,
      attemptNumber: attemptCount + 1,
      reason: dto.reason,
      attemptedAt: new Date(),
    });

    await this.historyRepo.create({
      saleId,
      action: 'DELIVERY_FAILED',
      snapshot: {
        attemptNumber: attemptCount + 1,
        reason: dto.reason,
      } as object,
      performedBy: staffId,
      performedByName: name,
    });
  }

  // ─── CERRAR VENTA ─────────────────────────────────────────────────────────

  async close(saleId: string, user: JwtPayload): Promise<void> {
    const { staffId, name } = this.extractUser(user);
    const sale = await this.findById(saleId);

    if (sale.status !== SaleStatus.DELIVERED) {
      throw new BadRequestException(
        `La venta debe estar en estado ${SaleStatus.DELIVERED}`,
      );
    }

    await this.salesRepo.updateStatus(saleId, SaleStatus.CLOSED);

    await this.historyRepo.create({
      saleId,
      action: 'SALE_CLOSED',
      snapshot: { previousStatus: sale.status, newStatus: SaleStatus.CLOSED } as object,
      performedBy: staffId,
      performedByName: name,
    });
  }

  // ─── OBSERVACIÓN ─────────────────────────────────────────────────────────

  async updateObservation(saleId: string, observation: string | undefined): Promise<void> {
    await this.findById(saleId);
    await this.salesRepo.update(saleId, { observation: observation ?? null as any });
  }

  // ─── REASIGNAR COLLECTOR ──────────────────────────────────────────────────

  async assignCollector(saleId: string, collectorId: string, user: JwtPayload): Promise<void> {
    const { staffId, name } = this.extractUser(user);
    const sale = await this.findById(saleId);

    const previousCollectorId = sale.assignedCollectorId;
    await this.salesRepo.update(saleId, { assignedCollectorId: collectorId });

    await this.historyRepo.create({
      saleId,
      action: 'COLLECTOR_REASSIGNED',
      snapshot: { previousCollectorId, newCollectorId: collectorId } as object,
      performedBy: staffId,
      performedByName: name,
    });
  }

  // ─── HELPERS ──────────────────────────────────────────────────────────────

  private extractUser(user: JwtPayload) {
    return {
      staffId: user.sub,
      societyId: user.societyId,
      name: user.email,
      role: user.role as StaffRole,
    };
  }

  private calculateDueDates(firstDueDate: Date, count: number, frequency: PaymentFrequency): Date[] {
    const dates: Date[] = [];
    for (let i = 0; i < count; i++) {
      const d = new Date(firstDueDate);
      if (frequency === PaymentFrequency.WEEKLY) {
        d.setDate(d.getDate() + i * 7);
      } else {
        d.setMonth(d.getMonth() + i);
      }
      dates.push(d);
    }
    return dates;
  }
}
