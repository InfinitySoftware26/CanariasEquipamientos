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
   * Se ejecuta todos los días a las 06:00
   * horario de Argentina.
   *
   * Flujo:
   *
   * 1. Busca entregas programadas para hoy.
   * 2. Busca cobranzas recurrentes correspondientes a hoy.
   * 3. Agrupa por zona + cobrador.
   * 4. Crea o completa la hoja correspondiente.
   *
   * Formato cron:
   *
   * segundo minuto hora día mes díaSemana
   *
   * 0 0 6 * * *
   */
  @Cron("0 0 6 * * *", {
    name: "daily-route-sheets",

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
