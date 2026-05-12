import { Injectable } from '@nestjs/common';
import { AddSocietyDto } from './dto/addSocietyDto';
import { SocietyRepository } from './society.repository';

@Injectable()
export class SocietyService {
  constructor(private readonly societyRepository: SocietyRepository) {}

  findAllSocietiesService() {
    return this.societyRepository.findAllSocieties();
  }

  findOneSocietyService(id: string) {
    return this.societyRepository.findOneSociety(id);
  }

  addSocietyService(society: AddSocietyDto) {
    return this.societyRepository.createSociety(society);
  }
}