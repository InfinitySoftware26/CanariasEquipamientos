import { Inject, Injectable, NotFoundException } from "@nestjs/common";

import {
  ISalesRepository,
  SALES_REPOSITORY,
} from "../interfaces/sales-repository.interface";

import {
  ISaleValidationsRepository,
  SALE_VALIDATIONS_REPOSITORY,
} from "../interfaces/sale-validations-repository.interface";

import {
  IDeliveryAttemptsRepository,
  DELIVERY_ATTEMPTS_REPOSITORY,
} from "../interfaces/delivery-attempts-repository.interface";

import {
  ISaleHistoryRepository,
  SALE_HISTORY_REPOSITORY,
} from "../interfaces/sale-history-repository.interface";

import { Sale } from "../entities/sale.entity";

@Injectable()
export class SalesQueryService {
  constructor(
    @Inject(SALES_REPOSITORY)
    private readonly salesRepo: ISalesRepository,

    @Inject(SALE_VALIDATIONS_REPOSITORY)
    private readonly validationsRepo: ISaleValidationsRepository,

    @Inject(DELIVERY_ATTEMPTS_REPOSITORY)
    private readonly deliveryAttemptsRepo: IDeliveryAttemptsRepository,

    @Inject(SALE_HISTORY_REPOSITORY)
    private readonly historyRepo: ISaleHistoryRepository,
  ) {}

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

    if (!sale) {
      throw new NotFoundException(`Venta ${id} no encontrada`);
    }

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
}
