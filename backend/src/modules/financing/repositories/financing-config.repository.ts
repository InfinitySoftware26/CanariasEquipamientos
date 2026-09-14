import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FinancingConfiguration } from '../entities/financing-configuration.entity';
import { IFinancingConfigRepository } from '../interfaces/financing-config-repository.interface';
import { CreateFinancingConfigDto } from '../dto/create-financing-config.dto';
import { UpdateFinancingConfigDto } from '../dto/update-financing-config.dto';
@Injectable()
export class FinancingConfigRepository implements IFinancingConfigRepository {
  constructor(
    @InjectRepository(FinancingConfiguration)
    private readonly repo: Repository<FinancingConfiguration>,
  ) { }

  async create(
    societyId: string,
    dto: CreateFinancingConfigDto,
  ): Promise<FinancingConfiguration> {
    const config = this.repo.create({
      societyId,
      name: dto.name,
      financingRate: dto.financingRate,
      isGlobal: dto.isGlobal ?? true,
      isActive: true,
    });

    const saved = await this.repo.save(config);

    if (dto.productIds && dto.productIds.length > 0) {
      await this.repo
        .createQueryBuilder()
        .relation(FinancingConfiguration, 'products')
        .of(saved)
        .add(dto.productIds);
    }

    return this.repo.findOneOrFail({
      where: { financingConfigId: saved.financingConfigId },
      relations: ['products'],
    });
  }

  async findAllBySociety(societyId: string): Promise<FinancingConfiguration[]> {
    return this.repo.find({
      where: { societyId },
      relations: ['products'],
      order: { createdAt: 'DESC' },
    });
  }

  async findById(
    societyId: string,
    financingConfigId: string,
  ): Promise<FinancingConfiguration | null> {
    return this.repo.findOne({
      where: { societyId, financingConfigId },
      relations: ['products'],
    });
  }

  async update(
    societyId: string,
    financingConfigId: string,
    dto: UpdateFinancingConfigDto,
  ): Promise<FinancingConfiguration> {
    await this.repo.update(
      { societyId, financingConfigId },
      {
        name: dto.name,
        financingRate: dto.financingRate,
        isActive: dto.isActive,
      },
    );

    return this.repo.findOneOrFail({
      where: { societyId, financingConfigId },
      relations: ['products'],
    });
  }

  async delete(societyId: string, financingConfigId: string): Promise<void> {
    await this.repo.delete({ societyId, financingConfigId });
  }
}
