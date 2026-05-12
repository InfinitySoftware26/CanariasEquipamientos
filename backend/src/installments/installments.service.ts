import { Injectable } from '@nestjs/common';
import { CreateInstallmentDto } from './dto/createInstallmentDto';
import { UpdateInstallmentDto } from './dto/updateInstalmentDto';
import { InstallmentsRepository } from './installments.repository';

@Injectable()
export class InstallmentsService {
  constructor(
    private readonly installmentsRepository: InstallmentsRepository,
  ) {}
  getAllInstallmentsService() {
    return this.installmentsRepository.getAllInstallments();
  }
  getInstallmentByIdService(id: string) {
    return this.installmentsRepository.getInstallmentById(id);
  }
  getinstallmentBySaleIdService(saleId: string) {
    return this.installmentsRepository.getinstallmentBySaleId(saleId);
  }
  getinstallmentByClientIdService(clientId: string) {
    return this.installmentsRepository.getinstallmentByClientId(clientId);
  }
  updateInstallmentService(id: string, updateInstallment: UpdateInstallmentDto) {
    return this.installmentsRepository.updateInstallment(id, updateInstallment);
  }
  createInstallmentService(createInstallment: CreateInstallmentDto) {
    return this.installmentsRepository.createInstallment(createInstallment);
  }
}
