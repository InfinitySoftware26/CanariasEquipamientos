import { Injectable } from "@nestjs/common";

import { InjectRepository } from "@nestjs/typeorm";

import { Repository } from "typeorm";

import { SaleValidation } from "../entities/sale-validation.entity";

import { ISaleValidationsRepository } from "../interfaces/sale-validations-repository.interface";

import { ValidationStep } from "../../../common/enums/validation-step.enum";

import { ValidationStatus } from "../../../common/enums/validation-status.enum";

@Injectable()
export class SaleValidationsRepository implements ISaleValidationsRepository {
  constructor(
    @InjectRepository(SaleValidation)
    private readonly repo: Repository<SaleValidation>,
  ) {}

  async create(data: {
    saleId: string;

    staffId: string;

    step: ValidationStep;

    status: ValidationStatus;

    observations?: string;

    dniCopyReceived?: boolean;

    salaryReceiptReceived?: boolean;

    otherDocumentsReceived?: boolean;

    validatedAt: Date;
  }): Promise<SaleValidation> {
    const entity = this.repo.create({
      saleId: data.saleId,

      staffId: data.staffId,

      step: data.step,

      status: data.status,

      observations: data.observations ?? null,

      dniCopyReceived: data.dniCopyReceived ?? null,

      salaryReceiptReceived: data.salaryReceiptReceived ?? null,

      otherDocumentsReceived: data.otherDocumentsReceived ?? null,

      validatedAt: data.validatedAt,
    });

    return this.repo.save(entity);
  }

  findBySale(saleId: string): Promise<SaleValidation[]> {
    return this.repo.find({
      where: {
        saleId,
      },

      order: {
        validatedAt: "ASC",
      },
    });
  }
}
