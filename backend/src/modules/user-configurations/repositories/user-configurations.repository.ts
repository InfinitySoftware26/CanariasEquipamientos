import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { UserConfiguration } from '../entities/user-configuration.entity';
import { IUserConfigurationsRepository } from '../interfaces/user-configurations-repository.interface';

@Injectable()
export class UserConfigurationsRepository implements IUserConfigurationsRepository {
  constructor(
    @InjectRepository(UserConfiguration) private readonly repo: Repository<UserConfiguration>,
  ) {}

  findByStaff(staffId: string): Promise<UserConfiguration | null> {
    return this.repo.findOne({ where: { staffId } });
  }

  async create(data: Partial<UserConfiguration>): Promise<UserConfiguration> {
    return this.repo.save(this.repo.create(data));
  }

  async update(staffId: string, data: Partial<UserConfiguration>): Promise<void> {
    await this.repo.update({ staffId }, data as QueryDeepPartialEntity<UserConfiguration>);
  }
}
