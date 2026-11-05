import { BadRequestException, Inject, Injectable } from "@nestjs/common";

import {
  ISalesRepository,
  SALES_REPOSITORY,
} from "../interfaces/sales-repository.interface";

import { SaleStatus } from "../../../common/enums/sale-status.enum";
import { CommissionPeriod } from "../../../common/enums/commission-period.enum";

@Injectable()
export class SellerCommissionService {
  constructor(
    @Inject(SALES_REPOSITORY)
    private readonly salesRepo: ISalesRepository,
  ) {}

  async getSellerCommissions(
    staffId: string,
    societyId: string,
    period: CommissionPeriod,
    dateStr?: string,
  ) {
    const { from, to } = this.resolveCommissionPeriodRange(period, dateStr);

    const sales = await this.salesRepo.findBySellerInRange(
      staffId,
      societyId,
      from,
      to,
    );

    const closedSales = sales.filter(
      (sale) => sale.status === SaleStatus.CLOSED,
    );

    const totalCommission =
      Math.round(
        closedSales.reduce(
          (sum, sale) => sum + Number(sale.sellerCommission),
          0,
        ) * 100,
      ) / 100;

    const averageCommission =
      closedSales.length > 0
        ? Math.round((totalCommission / closedSales.length) * 100) / 100
        : 0;

    return {
      period,
      from: from.toISOString(),
      to: to.toISOString(),
      salesCount: sales.length,
      closedSalesCount: closedSales.length,
      totalCommission,
      averageCommission,
      sales,
    };
  }

  private resolveCommissionPeriodRange(
    period: CommissionPeriod,
    dateStr?: string,
  ): {
    from: Date;
    to: Date;
  } {
    const anchor = dateStr ? new Date(dateStr) : new Date();

    if (Number.isNaN(anchor.getTime())) {
      throw new BadRequestException("Fecha inválida");
    }

    let from: Date;
    let to: Date;

    switch (period) {
      case CommissionPeriod.YEAR: {
        from = new Date(anchor.getFullYear(), 0, 1);

        to = new Date(anchor.getFullYear(), 11, 31, 23, 59, 59, 999);

        break;
      }

      case CommissionPeriod.MONTH: {
        from = new Date(anchor.getFullYear(), anchor.getMonth(), 1);

        to = new Date(
          anchor.getFullYear(),
          anchor.getMonth() + 1,
          0,
          23,
          59,
          59,
          999,
        );

        break;
      }

      case CommissionPeriod.WEEK: {
        const day = anchor.getDay();

        const diffToMonday = day === 0 ? -6 : 1 - day;

        from = new Date(
          anchor.getFullYear(),
          anchor.getMonth(),
          anchor.getDate() + diffToMonday,
        );

        to = new Date(
          from.getFullYear(),
          from.getMonth(),
          from.getDate() + 6,
          23,
          59,
          59,
          999,
        );

        break;
      }

      case CommissionPeriod.DAY: {
        from = new Date(
          anchor.getFullYear(),
          anchor.getMonth(),
          anchor.getDate(),
        );

        to = new Date(
          anchor.getFullYear(),
          anchor.getMonth(),
          anchor.getDate(),
          23,
          59,
          59,
          999,
        );

        break;
      }

      default: {
        throw new BadRequestException(
          "period debe ser day, week, month o year",
        );
      }
    }

    return {
      from,
      to,
    };
  }
}
