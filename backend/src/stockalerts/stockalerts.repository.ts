import { Injectable } from '@nestjs/common';
import { CreateStockalertDto } from './dto/createStockalertDto';
import { UpdateStockalertDto } from './dto/updateStockalertDto';

export enum stockalertStatus {
  ACTIVE = 'ACTIVE',
  PENDING = 'PENDING',
  RESOLVED = 'RESOLVED',
  CANCELLED = 'CANCELLED',
}

@Injectable()
export class StockalertsRepository {
  findAllStockAlerts() {
    return 'Esta accion retorna todas las alertas de stock';
  }

  findStockAlertById(id: string) {
    return `Esta accion retorna la alerta de stock con id ${id}`;
  }

  createStockAlert(alert: CreateStockalertDto) {
    return 'Esta accion crea una nueva alerta de stock';
  }

  updateStockAlertStatus(id: string, alert: UpdateStockalertDto) {
    return `Esta accion actualiza el estado de la alerta de stock con id ${id}`;
  }

  deleteStockAlert(id: string) {
    return `Esta accion elimina la alerta de stock con id ${id}`;
  }
}
