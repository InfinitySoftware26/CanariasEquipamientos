import { Test } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { InstallmentStatus } from "../../../common/enums/installment-status.enum";
import { Installment } from "../entities/installment.entity";
import { INSTALLMENTS_REPOSITORY } from "../interfaces/installments-repository.interface";
import { InstallmentsService } from "./installments.service";

describe("Mora de cuotas", () => {
  const repository = { findById: jest.fn(), update: jest.fn() };
  let service: InstallmentsService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        InstallmentsService,
        { provide: INSTALLMENTS_REPOSITORY, useValue: repository },
        { provide: getRepositoryToken(Installment), useValue: {} },
        { provide: DataSource, useValue: {} },
      ],
    }).compile();
    service = module.get(InstallmentsService);
  });

  it("no genera mora para la primera cuota y corrige mora previa", async () => {
    repository.findById.mockResolvedValue(Object.assign(new Installment(), {
      installmentNumber: 1,
      status: InstallmentStatus.OVERDUE,
      lateInterestAmount: 50,
      paidAmount: 0,
    }));
    expect(await service.calculateLateInterest("first", new Date(2026, 8, 15))).toBe(0);
    expect(repository.update).toHaveBeenCalledWith("first", expect.objectContaining({
      lateInterestAmount: 0,
      status: InstallmentStatus.PENDING,
    }));
  });

  it("no agrega mora para una cuota posterior en la fecha de vencimiento", async () => {
    repository.findById.mockResolvedValue(Object.assign(new Installment(), {
      installmentNumber: 2,
      status: InstallmentStatus.PENDING,
      dueDate: new Date(2026, 8, 10),
      lateInterestAmount: 0,
      dailyLateInterestRate: 0.01,
      remainingAmount: 100,
    }));
    expect(await service.calculateLateInterest("second", new Date(2026, 8, 10))).toBe(0);
    expect(repository.update).not.toHaveBeenCalled();
  });

  it("calcula la mora de una cuota posterior solo hasta la fecha de referencia", async () => {
    repository.findById.mockResolvedValue(Object.assign(new Installment(), {
      installmentNumber: 2,
      status: InstallmentStatus.PENDING,
      dueDate: new Date(2026, 8, 10),
      lateInterestAmount: 0,
      dailyLateInterestRate: 0.01,
      remainingAmount: 100,
      lateInterestCalculatedAt: null,
    }));
    expect(await service.calculateLateInterest("second", new Date(2026, 8, 12))).toBe(2);
    expect(repository.update).toHaveBeenLastCalledWith("second", expect.objectContaining({
      lateInterestAmount: 2,
      lateInterestCalculatedAt: new Date(2026, 8, 12),
      status: InstallmentStatus.OVERDUE,
    }));
  });
});
