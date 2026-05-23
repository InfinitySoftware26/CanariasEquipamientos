import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Staff } from '../entities/staff.entity';

@Injectable()
export class StaffService {
  constructor(@InjectRepository(Staff) private readonly repo: Repository<Staff>) {}

  findByEmailWithPassword(email: string): Promise<Staff | null> {
    return this.repo.createQueryBuilder('staff')
      .addSelect('staff.passwordHash')
      .where('staff.email = :email AND staff.isActive = true', { email })
      .getOne();
  }

  async findById(id: string): Promise<Staff> {
    const staff = await this.repo.findOne({ where: { staffId: id, isActive: true } });
    if (!staff) throw new NotFoundException('Empleado ' + id + ' no encontrado');
    return staff;
  }
}
