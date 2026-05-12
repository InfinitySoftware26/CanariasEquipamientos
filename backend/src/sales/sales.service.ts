import { Injectable } from '@nestjs/common';
import { CreateSaleDto } from './dto/createSalesDto';
import { UpdateSaleDto } from './dto/updateSalesDto';
import { SalesRepository } from './sales.repository';

@Injectable()
export class SalesService {
  constructor(private readonly salesRepository: SalesRepository) {}
  createService(sale: CreateSaleDto) {
    return this.salesRepository.saleCreate(sale);
  }

  salesFindAllService() {
    return this.salesRepository.saleFindAll();
  }

  salesFindOneService(id: string) {
    return this.salesRepository.saleFindOne(id);
  }

  salesUpdateService(id: string, status: UpdateSaleDto) {
    return this.salesRepository.saleUpdate(id, status);
  }

  saleDeleteService(id: string) {
    return this.salesRepository.saleDelete(id);
  }

  salesFindByDateRangeService(from: string, to: string) {
    return this.salesRepository.findByDateRange(from, to);
  }

  salesFindByStaffService(staffId: string) {
    return this.salesRepository.findByStaff(staffId);
  }

  salesFindByClientService(clientId: string) {
    return this.salesRepository.findByClient(clientId);
  }
}
