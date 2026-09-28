import { Injectable, NotFoundException } from "@nestjs/common";

import { InjectRepository } from "@nestjs/typeorm";

import { QueryRunner, Repository } from "typeorm";

import { Society, SocietyStatus } from "../entities/society.entity";

import { ISocietiesRepository } from "../interfaces/societies-repository.interface";

@Injectable()
export class SocietiesRepository implements ISocietiesRepository {
  constructor(
    @InjectRepository(Society)
    private readonly repo: Repository<Society>,
  ) {}

  findAll(): Promise<Society[]> {
    return this.repo.find({
      order: {
        name: "ASC",
      },
    });
  }

  findById(id: string): Promise<Society | null> {
    return this.repo.findOne({
      where: {
        societyId: id,
      },
    });
  }

  findByTaxId(taxId: string): Promise<Society | null> {
    return this.repo.findOne({
      where: {
        taxId,
      },
    });
  }

  async create(data: Partial<Society>, qr?: QueryRunner): Promise<Society> {
    const repository = qr ? qr.manager.getRepository(Society) : this.repo;

    return repository.save(repository.create(data));
  }

  async update(
    id: string,
    data: Partial<Society>,
    qr?: QueryRunner,
  ): Promise<Society> {
    const repository = qr ? qr.manager.getRepository(Society) : this.repo;

    await repository.update(
      {
        societyId: id,
      },
      data,
    );

    const updated = await repository.findOne({
      where: {
        societyId: id,
      },
    });

    if (!updated) {
      throw new NotFoundException("Sociedad no encontrada");
    }

    return updated;
  }

  async softDelete(id: string): Promise<void> {
    await this.repo.update(
      {
        societyId: id,
      },
      {
        status: SocietyStatus.INACTIVE,
      },
    );
  }
}
