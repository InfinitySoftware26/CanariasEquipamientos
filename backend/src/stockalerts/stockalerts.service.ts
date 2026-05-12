import { Injectable } from '@nestjs/common';
import { StockalertsRepository } from './stockalerts.repository';
import { CreateStockalertDto } from './dto/createStockalertDto';
import { UpdateStockalertDto } from './dto/updateStockalertDto';

@Injectable()
export class StockalertsService {
  constructor(private readonly stockalertsRepository: StockalertsRepository) {}

  findAllStockAlerts() {
    return this.stockalertsRepository.findAllStockAlerts();
  }

  findStockAlertById(id: string) {
    return this.stockalertsRepository.findStockAlertById(id);
  }

  createStockAlert(alert: CreateStockalertDto) {
    return this.stockalertsRepository.createStockAlert(alert);
  }

  updateStockAlertStatus(id: string, alert: UpdateStockalertDto) {
    return this.stockalertsRepository.updateStockAlertStatus(id, alert);
  }

  deleteStockAlert(id: string) {
    return this.stockalertsRepository.deleteStockAlert(id);
  }
}
