import {
  Injectable, Inject, NotFoundException,
  ConflictException, BadRequestException,
} from '@nestjs/common';
import { ISocietiesRepository, SOCIETIES_REPOSITORY } from '../interfaces/societies-repository.interface';
import { IStaffSocietiesRepository, STAFF_SOCIETIES_REPOSITORY } from '../interfaces/staff-societies-repository.interface';
import { CreateSocietyDto } from '../dto/create-society.dto';
import { UpdateSocietyDto } from '../dto/update-society.dto';
import { AssignStaffDto } from '../dto/assign-staff.dto';
import { Society, SocietyStatus } from '../entities/society.entity';
import { StaffSocietyStatus } from '../entities/staff-society.entity';

@Injectable()
export class SocietiesService {
  constructor(
    @Inject(SOCIETIES_REPOSITORY)
    private readonly societiesRepo: ISocietiesRepository,
    @Inject(STAFF_SOCIETIES_REPOSITORY)
    private readonly staffSocietiesRepo: IStaffSocietiesRepository,
  ) {}

  findAll(): Promise<Society[]> {
    return this.societiesRepo.findAll();
  }

  async findById(id: string): Promise<Society> {
    const society = await this.societiesRepo.findById(id);
    if (!society) throw new NotFoundException('Sociedad ' + id + ' no encontrada');
    return society;
  }

  async create(dto: CreateSocietyDto): Promise<Society> {
    const existing = await this.societiesRepo.findByTaxId(dto.taxId);
    if (existing) throw new ConflictException('Ya existe una sociedad con el CUIT ' + dto.taxId);
    return this.societiesRepo.create(dto);
  }

  async update(id: string, dto: UpdateSocietyDto): Promise<Society> {
    await this.findById(id);
    return this.societiesRepo.update(id, dto);
  }

  async deactivate(id: string): Promise<void> {
    const society = await this.findById(id);
    if (society.status === SocietyStatus.INACTIVE)
      throw new BadRequestException('La sociedad ya esta inactiva');
    await this.societiesRepo.softDelete(id);
  }

  async assignStaff(societyId: string, dto: AssignStaffDto): Promise<void> {
    await this.findById(societyId);
    await this.staffSocietiesRepo.upsert(
      dto.staffId,
      societyId,
      (dto.status as unknown as StaffSocietyStatus) ?? StaffSocietyStatus.ACTIVE,
    );
  }

  async getStaff(societyId: string): Promise<any[]> {
    await this.findById(societyId);
    return this.staffSocietiesRepo.findBySocietyWithStaff(societyId);
  }

  getSocietiesForStaff(staffId: string): Promise<{ societyId: string; societyName: string; status: string }[]> {
    return this.staffSocietiesRepo.findByStaff(staffId);
  }
}
