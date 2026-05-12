import { Injectable } from '@nestjs/common';
import { clousuresRepository } from './closures.repository';
import { CreateClosureDto } from './dto/createClouseDto';

@Injectable()
export class ClosuresService {
  constructor(private readonly clousuresRepository: clousuresRepository) {}

  createClosureService(closure: CreateClosureDto) {
    return this.clousuresRepository.create(closure);
  }

  getClosuresService() {
    return this.clousuresRepository.findAll();
  }

  getClosureByIdService(id: string) {
    return this.clousuresRepository.findById(id);
  }

  getClosuresByStaffIdService(staffId: string) {
    return this.clousuresRepository.findByStaffId(staffId);
  }
}
