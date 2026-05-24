import {
  Injectable, Inject, NotFoundException,
  ConflictException, BadRequestException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ISocietiesRepository, SOCIETIES_REPOSITORY } from '../interfaces/societies-repository.interface';
import { CreateSocietyDto } from '../dto/create-society.dto';
import { UpdateSocietyDto } from '../dto/update-society.dto';
import { AssignStaffDto } from '../dto/assign-staff.dto';
import { Society, SocietyStatus } from '../entities/society.entity';

@Injectable()
export class SocietiesService {
  constructor(
    @Inject(SOCIETIES_REPOSITORY)
    private readonly societiesRepo: ISocietiesRepository,
    @InjectDataSource()
    private readonly dataSource: DataSource,
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
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();
    try {
      const existing = await qr.manager.query(
        'SELECT * FROM "STAFF_SOCIETIES" WHERE staff_id = $1 AND society_id = $2',
        [dto.staffId, societyId],
      );
      if (existing.length > 0) {
        await qr.manager.query(
          'UPDATE "STAFF_SOCIETIES" SET status = $1 WHERE staff_id = $2 AND society_id = $3',
          [dto.status ?? 'active', dto.staffId, societyId],
        );
      } else {
        await qr.manager.query(
          'INSERT INTO "STAFF_SOCIETIES" (staff_society_id, staff_id, society_id, status, assigned_at) VALUES (uuid_generate_v4(), $1, $2, $3, NOW())',
          [dto.staffId, societyId, dto.status ?? 'active'],
        );
      }
      await qr.commitTransaction();
    } catch (err) {
      await qr.rollbackTransaction();
      throw err;
    } finally {
      await qr.release();
    }
  }

  async getStaff(societyId: string): Promise<any[]> {
    await this.findById(societyId);
    return this.dataSource.query(
      'SELECT s.staff_id, s.name, s.email, s.role, ss.status, ss.assigned_at ' +
      'FROM "STAFF" s ' +
      'INNER JOIN "STAFF_SOCIETIES" ss ON ss.staff_id = s.staff_id ' +
      'WHERE ss.society_id = $1 ' +
      'ORDER BY s.name ASC',
      [societyId],
    );
  }
}
