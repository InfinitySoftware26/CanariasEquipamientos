import { Injectable, Logger } from "@nestjs/common";

import { Cron } from "@nestjs/schedule";
import { RouteSheetsAutomationService } from "./route-sheet-automation.service";

@Injectable()
export class RouteSheetsCronService {
  private readonly logger = new Logger(RouteSheetsCronService.name);

  constructor(
    private readonly automationService: RouteSheetsAutomationService,
  ) {}

  // ============================================================
  // GENERACIÓN AUTOMÁTICA DIARIA
  // ============================================================

  /**
   * 06:00 todos los días.
   *
   * segundo minuto hora día mes díaSemana
   *
   * 0 0 6 * * *
   */
  @Cron("*/30 * * * * *", {
    name: "daily-route-sheets-test",
    timeZone: "America/Argentina/Buenos_Aires",
    waitForCompletion: true,
  })
  async generateDailyRouteSheets() {
    const routeDate = this.automationService.getToday();

    this.logger.log(`Generando hojas automáticamente para ${routeDate}`);

    try {
      const result =
        await this.automationService.generateForAllSocieties(routeDate);

      this.logger.log(
        [
          "Generación finalizada",
          `fecha=${routeDate}`,
          `sociedades=${result.societiesProcessed}`,
        ].join(" | "),
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error desconocido";

      this.logger.error(`Falló generación automática: ${message}`);
    }
  }
}
