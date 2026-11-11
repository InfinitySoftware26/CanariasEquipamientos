import { Test } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { FailedVisitReason } from "../../../common/enums/failed-visit-reason.enum";
import { InstallmentStatus } from "../../../common/enums/installment-status.enum";
import { RouteSheetItemResult } from "../../../common/enums/route-sheet-item-result.enum";
import { RouteSheetItemType } from "../../../common/enums/route-sheet-item-type.enum";
import { RouteSheetStatus } from "../../../common/enums/route-sheet-status.enum";
import { SaleStatus } from "../../../common/enums/sale-status.enum";
import { StaffRole } from "../../../common/enums/staff-role.enum";
import { Client } from "../../clients/entities/client.entity";
import { FailedVisitsService } from "../../failed-visits/services/failed-visits.service";
import { Installment } from "../../installments/entities/installment.entity";
import { InstallmentsService } from "../../installments/services/installments.service";
import { PaymentsService } from "../../payments/services/payments.service";
import { Sale } from "../../sales/entities/sale.entity";
import { SalesService } from "../../sales/services/sales.service";
import { Staff } from "../../staff/entities/staff.entity";
import { StaffZone } from "../../zones/entities/staff-zone.entity";
import { Zone } from "../../zones/entities/zone.entity";
import { RouteSheetItem } from "../entities/route-sheet-item.entity";
import { RouteSheet } from "../entities/route-sheet.entity";
import { ROUTE_SHEET_ITEMS_REPOSITORY } from "../interfaces/route-sheet-items-repository.interface";
import { ROUTE_SHEETS_REPOSITORY } from "../interfaces/route-sheets-repository.interface";
import { RouteSheetItemsService } from "./route-sheet-items.service";
import { RouteSheetsService } from "./route-sheets.service";

describe("Entregas fallidas y mora en hojas", () => {
  const user = {
    sub: "collector",
    email: "collector@example.test",
    role: StaffRole.COLLECTOR,
    societyId: "society",
  };
  const sheet = {
    routeSheetId: "sheet",
    societyId: "society",
    zoneId: "zone",
    staffId: "collector",
    status: RouteSheetStatus.IN_PROGRESS,
  } as RouteSheet;
  const item = {
    itemId: "item",
    routeSheetId: "sheet",
    clientId: "client",
    saleId: "sale",
    installmentId: "old-installment",
    itemType: RouteSheetItemType.DELIVERY,
    result: RouteSheetItemResult.PENDING,
    visitedAt: null,
  } as RouteSheetItem;
  const failedItem = {
    ...item,
    result: RouteSheetItemResult.FAILED,
    visitedAt: new Date("2026-09-11T02:00:00Z"),
  };

  const items = {
    findById: jest.fn(),
    updateResult: jest.fn(),
    findActiveDeliveryBySale: jest.fn(),
    findLatestFailedDeliveryBySale: jest.fn(),
    createMany: jest.fn(),
  };
  const sheets = {
    findById: jest.fn(),
    findNextActiveForStaffZone: jest.fn(),
  };
  const sales = { failDelivery: jest.fn(), findById: jest.fn(), deliver: jest.fn() };
  const payments = { registerFromCollection: jest.fn() };
  const saleRepo = { findOne: jest.fn(), createQueryBuilder: jest.fn() };
  const clientRepo = { findOne: jest.fn(), find: jest.fn() };
  const installmentRepo = { findOne: jest.fn() };
  const installments = {
    calculateLateInterest: jest.fn(),
    findById: jest.fn(),
    getTotalToCollect: jest.fn(),
  };

  let itemService: RouteSheetItemsService;
  let sheetService: RouteSheetsService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        RouteSheetItemsService,
        RouteSheetsService,
        { provide: ROUTE_SHEET_ITEMS_REPOSITORY, useValue: items },
        { provide: ROUTE_SHEETS_REPOSITORY, useValue: sheets },
        { provide: SalesService, useValue: sales },
        { provide: PaymentsService, useValue: payments },
        { provide: FailedVisitsService, useValue: {} },
        { provide: InstallmentsService, useValue: installments },
        { provide: getRepositoryToken(Zone), useValue: {} },
        { provide: getRepositoryToken(StaffZone), useValue: {} },
        { provide: getRepositoryToken(Staff), useValue: {} },
        { provide: getRepositoryToken(Client), useValue: clientRepo },
        { provide: getRepositoryToken(Installment), useValue: installmentRepo },
        { provide: getRepositoryToken(Sale), useValue: saleRepo },
      ],
    }).compile();
    itemService = module.get(RouteSheetItemsService);
    sheetService = module.get(RouteSheetsService);
    items.findById.mockResolvedValueOnce(item).mockResolvedValue(failedItem);
    sheets.findById.mockResolvedValue(sheet);
    saleRepo.findOne.mockResolvedValue({
      saleId: "sale",
      status: SaleStatus.PENDING_DELIVERY,
      assignedCollectorId: "collector",
      firstInstallmentOnDelivery: true,
    });
    clientRepo.findOne.mockResolvedValue({ zoneId: "zone" });
    installmentRepo.findOne.mockResolvedValue({
      installmentId: "current-installment",
      isRefinanced: false,
    });
    items.findActiveDeliveryBySale.mockResolvedValue(null);
    sheets.findNextActiveForStaffZone.mockResolvedValue({
      routeSheetId: "next-sheet",
    });
  });

  it("persiste el motivo, conserva notas y agrega la visita a la siguiente hoja", async () => {
    await itemService.updateResult(
      "item",
      {
        result: RouteSheetItemResult.FAILED,
        failedVisitReason: FailedVisitReason.WRONG_ADDRESS,
        notes: "Sin numeración",
      },
      user,
    );

    expect(sales.failDelivery).toHaveBeenCalledWith(
      "sale",
      { reason: FailedVisitReason.WRONG_ADDRESS },
      user,
    );
    expect(items.updateResult).toHaveBeenCalledWith(
      "item", RouteSheetItemResult.FAILED, undefined, "Sin numeración",
      undefined, undefined,
    );
    expect(sheets.findNextActiveForStaffZone).toHaveBeenCalledWith(
      "society", "collector", "zone", "2026-09-10",
    );
    expect(items.createMany).toHaveBeenCalledWith([
      expect.objectContaining({
        routeSheetId: "next-sheet",
        saleId: "sale",
        installmentId: "current-installment",
        result: RouteSheetItemResult.PENDING,
      }),
    ]);
  });

  it("exige un motivo antes de registrar la falla", async () => {
    await expect(itemService.updateResult(
      "item", { result: RouteSheetItemResult.FAILED }, user,
    )).rejects.toThrow("failedVisitReason");
    expect(sales.failDelivery).not.toHaveBeenCalled();
    expect(items.updateResult).not.toHaveBeenCalled();
  });

  it("rechaza cobro parcial de la cuota 1 antes de confirmar la entrega", async () => {
    sales.findById.mockResolvedValue({
      status: SaleStatus.PENDING_DELIVERY,
      assignedCollectorId: "collector",
      firstInstallmentOnDelivery: true,
    });
    installments.getTotalToCollect.mockResolvedValue({ totalToCollect: 100 });
    await expect(itemService.updateResult("item", {
      result: RouteSheetItemResult.COMPLETED,
      productDelivered: true,
      paymentReceived: true,
      collectedAmount: 99,
    }, user)).rejects.toThrow("primera cuota debe cobrarse completa");
    expect(payments.registerFromCollection).not.toHaveBeenCalled();
    expect(sales.deliver).not.toHaveBeenCalled();
  });

  it("permite registrar un cobro parcial de una cuota posterior", async () => {
    items.findById.mockReset().mockResolvedValue({
      ...item,
      itemType: RouteSheetItemType.INSTALLMENT,
      installmentId: "installment-2",
    });
    await itemService.updateResult("item", {
      result: RouteSheetItemResult.COMPLETED,
      collectedAmount: 25,
    }, user);
    expect(payments.registerFromCollection).toHaveBeenCalledWith(
      expect.objectContaining({ installmentId: "installment-2", amount: 25 }),
    );
  });

  it("no crea duplicados cuando ya existe una entrega activa", async () => {
    items.findActiveDeliveryBySale.mockResolvedValue(item);
    await sheetService.addFailedDeliveryToNextSheet(failedItem, sheet);
    expect(sheets.findNextActiveForStaffZone).not.toHaveBeenCalled();
    expect(items.createMany).not.toHaveBeenCalled();
  });

  it("no crea un ítem cuando aún no hay hoja futura", async () => {
    sheets.findNextActiveForStaffZone.mockResolvedValue(null);
    await sheetService.addFailedDeliveryToNextSheet(failedItem, sheet);
    expect(items.createMany).not.toHaveBeenCalled();
  });

  it("rechaza incorporar una entrega cuya zona o cobrador cambió", async () => {
    clientRepo.findOne.mockResolvedValue({ zoneId: "other-zone" });
    await expect(
      sheetService.addFailedDeliveryToNextSheet(failedItem, sheet),
    ).rejects.toThrow("zona cambiaron");
    expect(items.createMany).not.toHaveBeenCalled();
  });

  it("recupera un reintento al crear una hoja posterior, no el día de la visita", async () => {
    jest.useFakeTimers().setSystemTime(new Date("2026-09-10T18:00:00Z"));
    try {
      const query = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([{
          saleId: "sale",
          clientId: "client",
          deliveryDate: "2026-09-10",
          assignedCollectorId: "collector",
          firstInstallmentOnDelivery: true,
        }]),
      };
      saleRepo.createQueryBuilder.mockReturnValue(query);
      clientRepo.find.mockResolvedValue([{ clientId: "client", zoneId: "zone" }]);
      items.findLatestFailedDeliveryBySale.mockResolvedValue(failedItem);
      expect(await sheetService["getDeliveryCandidates"](
        "society", "2026-09-10",
        { zoneId: "zone", staffId: "collector", retriesOnly: true },
      )).toHaveLength(0);
      expect(await sheetService["getDeliveryCandidates"](
        "society", "2026-09-11",
        { zoneId: "zone", staffId: "collector", retriesOnly: true },
      )).toHaveLength(1);
      expect(await sheetService["getDeliveryCandidates"](
        "society", "2026-09-11",
        { zoneId: "zone", staffId: "other", retriesOnly: true },
      )).toHaveLength(0);
    } finally {
      jest.useRealTimers();
    }
  });

  it("usa el día argentino actual en vez de una fecha de hoja futura", async () => {
    jest.useFakeTimers().setSystemTime(new Date("2026-09-11T02:00:00Z"));
    try {
      const installment: Installment = Object.assign(new Installment(), {
        installmentId: "installment",
        installmentNumber: 2,
        dueDate: new Date(2026, 8, 10),
        status: InstallmentStatus.PENDING,
        remainingAmount: 100,
        lateInterestAmount: 0,
      });
      installments.findById.mockResolvedValue(installment);
      await sheetService["refreshLateInterest"](installment);
      expect(installments.calculateLateInterest).toHaveBeenCalledWith(
        "installment", new Date(2026, 8, 10),
      );
      expect(sheetService["getInstallmentDaysLate"](installment)).toBe(0);
      expect(sheetService["getCollectionState"](installment)).toBe("due_today");
      installment.installmentNumber = 1;
      installment.dueDate = new Date(2026, 8, 1);
      expect(sheetService["getInstallmentDaysLate"](installment)).toBe(0);
      expect(sheetService["getCollectionState"](installment)).toBe("pending");
      installment.installmentNumber = 2;
      installment.status = InstallmentStatus.PAID;
      expect(sheetService["getInstallmentDaysLate"](installment)).toBe(0);
      expect(sheetService["getCollectionState"](installment)).toBeNull();
    } finally {
      jest.useRealTimers();
    }
  });
});
