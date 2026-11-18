import { Test } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { validate } from "class-validator";
import { PaymentFrequency } from "../../../common/enums/payment-frequency.enum";
import { StaffRole } from "../../../common/enums/staff-role.enum";
import { FinancingService } from "../../financing/services/financing.service";
import { Installment } from "../../installments/entities/installment.entity";
import { Society } from "../../societies/entities/society.entity";
import { CreateSaleDto } from "../dto/create-sale.dto";
import { SaleProduct } from "../entities/sale-product.entity";
import { DELIVERY_ATTEMPTS_REPOSITORY } from "../interfaces/delivery-attempts-repository.interface";
import { SALE_HISTORY_REPOSITORY } from "../interfaces/sale-history-repository.interface";
import { SALES_REPOSITORY } from "../interfaces/sales-repository.interface";
import { SALE_VALIDATIONS_REPOSITORY } from "../interfaces/sale-validations-repository.interface";
import { SalesService } from "./sales.service";

describe("Condiciones financieras de una venta", () => {
  const sales = { create: jest.fn() };
  const history = { create: jest.fn() };
  const products = { create: jest.fn(), save: jest.fn() };
  const financing = { findOnePlan: jest.fn(), findOnePromotion: jest.fn() };
  const user = {
    sub: "seller",
    email: "seller@example.test",
    role: StaffRole.SELLER,
    societyId: "society",
  };
  const dto: CreateSaleDto = {
    clientId: "client",
    installmentsCount: 10,
    paymentFrequency: PaymentFrequency.MONTHLY,
    products: [{ productId: "product", quantity: 1, unitPrice: 1000 }],
  };
  let service: SalesService;

  beforeEach(async () => {
    jest.clearAllMocks();
    sales.create.mockImplementation(async (data) => ({ ...data, saleId: "sale" }));
    products.create.mockImplementation((data) => data);
    const module = await Test.createTestingModule({
      providers: [
        SalesService,
        { provide: SALES_REPOSITORY, useValue: sales },
        { provide: SALE_VALIDATIONS_REPOSITORY, useValue: {} },
        { provide: DELIVERY_ATTEMPTS_REPOSITORY, useValue: {} },
        { provide: SALE_HISTORY_REPOSITORY, useValue: history },
        { provide: getRepositoryToken(SaleProduct), useValue: products },
        { provide: getRepositoryToken(Installment), useValue: {} },
        { provide: getRepositoryToken(Society), useValue: {} },
        { provide: FinancingService, useValue: financing },
      ],
    }).compile();
    service = module.get(SalesService);
  });

  it("prioriza la tasa directa del plan sobre su configuración", async () => {
    financing.findOnePlan.mockResolvedValue({
      isActive: true,
      installmentsCount: 4,
      paymentFrequency: PaymentFrequency.WEEKLY,
      financingRate: 1.5,
      financingConfiguration: { financingRate: 0.2 },
    });
    await service.createSale({ ...dto, financingPlanId: "plan" }, user);
    expect(sales.create).toHaveBeenCalledWith(expect.objectContaining({
      installmentsCount: 4,
      paymentFrequency: PaymentFrequency.WEEKLY,
      installmentAmount: 625,
    }));
  });

  it("usa la configuración cuando el plan no tiene tasa directa", async () => {
    financing.findOnePlan.mockResolvedValue({
      isActive: true,
      installmentsCount: 4,
      paymentFrequency: PaymentFrequency.MONTHLY,
      financingRate: null,
      financingConfiguration: { financingRate: 0.2 },
    });
    await service.createSale({ ...dto, financingPlanId: "plan" }, user);
    expect(sales.create).toHaveBeenCalledWith(expect.objectContaining({
      installmentAmount: 300,
    }));
  });

  it("aplica el ajuste negativo y las condiciones del plan de la promoción", async () => {
    financing.findOnePromotion.mockResolvedValue({
      isActive: true,
      financingPlanId: "plan",
      discountPercentage: -0.5,
      installmentsCount: 12,
      paymentFrequency: PaymentFrequency.MONTHLY,
    });
    financing.findOnePlan.mockResolvedValue({
      isActive: true,
      installmentsCount: 4,
      paymentFrequency: PaymentFrequency.WEEKLY,
      financingRate: 0.2,
    });
    await service.createSale({ ...dto, promotionId: "promotion" }, user);
    expect(sales.create).toHaveBeenCalledWith(expect.objectContaining({
      installmentsCount: 4,
      paymentFrequency: PaymentFrequency.WEEKLY,
      installmentAmount: 175,
    }));
  });

  it("limita el descuento de la promoción independiente al 99%", async () => {
    financing.findOnePromotion.mockResolvedValue({
      isActive: true,
      financingPlanId: null,
      discountPercentage: -2,
      installmentsCount: 2,
      paymentFrequency: PaymentFrequency.WEEKLY,
    });
    await service.createSale({ ...dto, promotionId: "promotion" }, user);
    expect(sales.create).toHaveBeenCalledWith(expect.objectContaining({
      installmentsCount: 2,
      installmentAmount: 5,
    }));
  });

  it("acepta tasas personalizadas mayores al 100% y rechaza valores no finitos", async () => {
    const input = Object.assign(new CreateSaleDto(), dto, {
      clientId: "90be6836-e250-4407-a3e0-e62707976aac",
      financingRate: 5,
    });
    expect((await validate(input)).filter((error) => error.property === "financingRate")).toHaveLength(0);
    input.financingRate = Infinity;
    expect((await validate(input)).some((error) => error.property === "financingRate")).toBe(true);
  });
});
