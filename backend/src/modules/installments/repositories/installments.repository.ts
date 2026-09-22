import { Injectable } from "@nestjs/common";

import { InjectRepository } from "@nestjs/typeorm";

import { In, LessThan, Repository } from "typeorm";

import { Installment } from "../entities/installment.entity";

import { IInstallmentsRepository } from "../interfaces/installments-repository.interface";

import { InstallmentStatus } from "../../../common/enums/installment-status.enum";

@Injectable()
export class InstallmentsRepository implements IInstallmentsRepository {
  constructor(
    @InjectRepository(Installment)
    private readonly repo: Repository<Installment>,
  ) {}

  findBySale(saleId: string): Promise<Installment[]> {
    return this.repo.find({
      where: {
        saleId,
      },

      order: {
        installmentNumber: "ASC",
      },
    });
  }

  findByClient(clientId: string, societyId: string): Promise<Installment[]> {
    return this.repo.find({
      where: {
        clientId,
        societyId,
      },

      order: {
        dueDate: "ASC",
      },
    });
  }

  findOverdue(societyId: string): Promise<Installment[]> {
    return this.repo.find({
      where: {
        societyId,

        status: InstallmentStatus.OVERDUE,

        dueDate: LessThan(new Date()),
      },

      order: {
        dueDate: "ASC",
      },
    });
  }

  findPendingBySociety(societyId: string): Promise<Installment[]> {
    return this.repo.find({
      where: {
        societyId,

        status: In([
          InstallmentStatus.PENDING,
          InstallmentStatus.OVERDUE,
          InstallmentStatus.PARTIAL,
        ]),
      },

      order: {
        dueDate: "ASC",
      },
    });
  }

  findById(id: string): Promise<Installment | null> {
    return this.repo.findOne({
      where: {
        installmentId: id,
      },
    });
  }

  async createMany(data: Partial<Installment>[]): Promise<Installment[]> {
    const installments = data.map((item) => this.repo.create(item));

    return this.repo.save(installments);
  }

  async update(id: string, data: Partial<Installment>): Promise<void> {
    await this.repo.update(
      {
        installmentId: id,
      },
      data,
    );
  }

  async updateStatus(
    id: string,
    status: InstallmentStatus,
    paidAmount?: number,
  ): Promise<void> {
    const installment = await this.repo.findOneOrFail({
      where: {
        installmentId: id,
      },
    });

    const updates: Partial<Installment> = {
      status,
    };

    if (paidAmount !== undefined) {
      const installmentAmount = Number(installment.amount);

      const normalizedPaidAmount = Math.min(paidAmount, installmentAmount);

      updates.paidAmount = normalizedPaidAmount;

      updates.remainingAmount = Math.max(
        installmentAmount - normalizedPaidAmount,
        0,
      );
    }

    await this.repo.update(
      {
        installmentId: id,
      },
      updates,
    );
  }
}
