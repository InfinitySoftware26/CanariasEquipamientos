import { Injectable, Logger } from "@nestjs/common";

import { InjectRepository } from "@nestjs/typeorm";

import { Repository } from "typeorm";

import { RouteSheetsService } from "./route-sheets.service";

import { Sale } from "../../sales/entities/sale.entity";

interface SocietyRow {
  societyId: string;
}

@Injectable()
export class RouteSheetsAutomationService {
  private readonly logger = new Logger(RouteSheetsAutomationService.name);

  constructor(
    private readonly routeSheetsService: RouteSheetsService,

    @InjectRepository(Sale)
    private readonly saleRepo: Repository<Sale>,
  ) {}

  // ============================================================
  // GENERAR PARA TODAS LAS SOCIEDADES
  // ============================================================

  async generateForAllSocieties(routeDate: string) {
    /**
     * Procesamos únicamente sociedades que tienen
     * ventas con cobrador habitual asignado.
     */
    const rows = await this.saleRepo
      .createQueryBuilder("sale")
      .select("DISTINCT sale.society_id", "societyId")
      .where("sale.assigned_collector_id IS NOT NULL")
      .getRawMany<SocietyRow>();

    const results: Array<{
      societyId: string;

      success: boolean;

      created?: number;

      skipped?: number;

      error?: string;
    }> = [];

    for (const row of rows) {
      if (!row.societyId) {
        continue;
      }

      try {
        const result = await this.routeSheetsService.generateDailyForSociety(
          row.societyId,
          routeDate,
        );

        results.push({
          societyId: row.societyId,

          success: true,

          created: result.created,

          skipped: result.skipped,
        });

        this.logger.log(
          [
            `Sociedad ${row.societyId}`,
            `fecha=${routeDate}`,
            `creadas=${result.created}`,
            `omitidas=${result.skipped}`,
          ].join(" | "),
        );
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Error desconocido";

        results.push({
          societyId: row.societyId,

          success: false,

          error: message,
        });

        this.logger.error(
          `Error generando hojas para ${row.societyId}: ${message}`,
        );
      }
    }

    return {
      routeDate,

      societiesProcessed: rows.length,

      results,
    };
  }

  // ============================================================
  // FECHA ACTUAL ARGENTINA
  // ============================================================

  getToday(): string {
    /**
     * El servidor puede estar ejecutándose en UTC.
     * Esta fecha siempre se calcula en Argentina.
     */
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Argentina/Buenos_Aires",

      year: "numeric",

      month: "2-digit",

      day: "2-digit",
    }).format(new Date());
  }
}
