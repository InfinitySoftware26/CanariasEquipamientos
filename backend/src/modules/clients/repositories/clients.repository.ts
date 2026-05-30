import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Client } from "../entities/client.entity";
import { IClientsRepository } from "../interfaces/clients-repository.interface";

@Injectable()
export class ClientsRepository implements IClientsRepository {
  constructor(
    @InjectRepository(Client) private readonly repo: Repository<Client>
  ) {}

  create(data: Partial<Client>): Promise<Client> {
    return this.repo.save(this.repo.create(data));
  }

  async update(id: string, data: Partial<Client>): Promise<Client> {
    await this.repo.update({ clientId: id }, data);
    const found = await this.repo.findOne({ where: { clientId: id } });
    if (!found) throw new NotFoundException("Cliente no encontrado");
    return found;
  }

  findById(id: string): Promise<Client | null> {
    return this.repo.findOne({ where: { clientId: id } });
  }

  findAllBySociety(societyId: string): Promise<Client[]> {
    return this.repo.find({
      where: { societyId },
      order: { createdAt: "DESC" },
    });
  }

  async findPaged(
    filter: { name?: string },
    page: number,
    perPage: number,
    societyId?: string | null
  ): Promise<[Client[], number]> {
    const qb = this.repo.createQueryBuilder("client");
    if (societyId) {
      qb.andWhere("client.societyId = :societyId", { societyId });
    }
    if (filter?.name) {
      qb.andWhere("(client.name ILIKE :name OR client.surname ILIKE :name)", {
        name: `%${filter.name}%`,
      });
    }
    qb.orderBy("client.createdAt", "DESC");
    qb.skip((page - 1) * perPage).take(perPage);

    const [items, total] = await qb.getManyAndCount();
    return [items, total];
  }
}
